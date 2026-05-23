import crypto from "node:crypto";

export const SUPPORTED_STRIPE_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

const DEFAULT_TOLERANCE_SECONDS = 300;

export async function handleStripeWebhook({
  rawBody,
  signatureHeader,
  headers = {},
  env = process.env,
  fetchFn = fetch,
  now = Date.now(),
}) {
  if (!rawBody) {
    return response(400, { ok: false, error: "missing_raw_body" });
  }

  if (!signatureHeader) {
    return response(400, { ok: false, error: "missing_stripe_signature" });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return response(500, { ok: false, error: "missing_stripe_webhook_secret" });
  }

  const verification = verifyStripeSignature({
    rawBody,
    signatureHeader,
    secret: env.STRIPE_WEBHOOK_SECRET,
    now,
  });

  if (!verification.verified) {
    return response(400, { ok: false, error: "signature_verification_failed", reason: verification.reason });
  }

  let event;
  try {
    event = parseStripeEvent(rawBody);
  } catch {
    return response(400, { ok: false, error: "invalid_json" });
  }
  if (!SUPPORTED_STRIPE_EVENTS.has(event.type)) {
    return response(200, { ok: true, ignored: true, reason: "unsupported_event_type", event_type: event.type });
  }

  const configError = getConfigError(env);
  if (configError) {
    return response(500, { ok: false, error: configError });
  }

  const session = event.data?.object || {};
  const amount = extractCheckoutSessionAmount(session);

  if (event.type === "checkout.session.async_payment_failed") {
    await recordStripeEventToSupabase({ event, headers, amount, env, fetchFn });
    return response(200, { ok: true, recorded: true, event_type: event.type });
  }

  if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
    return response(200, {
      ok: true,
      ignored: true,
      reason: "payment_not_paid",
      payment_status: session.payment_status || null,
    });
  }

  if (amount.amountCents !== 100 || amount.currency !== "USD") {
    return response(200, {
      ok: true,
      ignored: true,
      reason: "amount_mismatch",
      amount_cents: amount.amountCents,
      currency: amount.currency,
    });
  }

  await recordPurchaseToSupabase({ event, headers, amount, env, fetchFn });
  return response(200, { ok: true, recorded: true, event_type: event.type });
}

export function verifyStripeSignature({
  rawBody,
  signatureHeader,
  secret,
  now = Date.now(),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
}) {
  const signature = parseStripeSignatureHeader(signatureHeader);
  if (!signature.timestamp || signature.signatures.length === 0) {
    return { verified: false, reason: "invalid_signature_header" };
  }

  const ageSeconds = Math.abs(Math.floor(now / 1000) - Number(signature.timestamp));
  if (ageSeconds > toleranceSeconds) {
    return { verified: false, reason: "timestamp_out_of_tolerance" };
  }

  const expectedSignature = createStripeSignature({ rawBody, timestamp: signature.timestamp, secret });
  const verified = signature.signatures.some((candidate) => timingSafeEqualHex(candidate, expectedSignature));

  return verified ? { verified: true } : { verified: false, reason: "signature_mismatch" };
}

export function createStripeSignature({ rawBody, timestamp, secret }) {
  return crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(`${timestamp}.`, "utf8"))
    .update(toBuffer(rawBody))
    .digest("hex");
}

export function extractCheckoutSessionAmount(session = {}) {
  const currency = session.currency ? String(session.currency).toUpperCase() : null;
  const amountCents = Number.isFinite(session.amount_total) ? session.amount_total : null;
  return { amountCents, currency };
}

function parseStripeEvent(rawBody) {
  return JSON.parse(toBuffer(rawBody).toString("utf8"));
}

function parseStripeSignatureHeader(signatureHeader = "") {
  return String(signatureHeader)
    .split(",")
    .reduce(
      (acc, part) => {
        const [key, value] = part.split("=");
        if (key === "t") {
          acc.timestamp = value;
        }
        if (key === "v1" && value) {
          acc.signatures.push(value);
        }
        return acc;
      },
      { timestamp: "", signatures: [] },
    );
}

async function recordPurchaseToSupabase({ event, headers = {}, amount, env = process.env, fetchFn = fetch }) {
  const session = event.data?.object || {};

  return insertSupabaseRow({
    env,
    fetchFn,
    table: "purchase_events",
    onConflict: "event_id",
    row: {
      event_id: event.id || session.id || null,
      provider: "stripe",
      amount_cents: amount.amountCents,
      currency: amount.currency,
      source: "stripe_webhook",
      variant: "one-dollar",
      page_path: "/api/stripe-webhook",
      visitor_id: session.client_reference_id || null,
      utm: {},
      user_agent: getHeader(headers, "user-agent"),
    },
  });
}

async function recordStripeEventToSupabase({ event, headers = {}, amount, env = process.env, fetchFn = fetch }) {
  const session = event.data?.object || {};

  return insertSupabaseRow({
    env,
    fetchFn,
    table: "landing_events",
    row: {
      event_name: event.type,
      source: "stripe_webhook",
      variant: "one-dollar",
      path: "/api/stripe-webhook",
      visitor_id: session.client_reference_id || null,
      payload: {
        stripe_event_id: event.id || null,
        checkout_session_id: session.id || null,
        payment_status: session.payment_status || null,
        amount_cents: amount.amountCents,
        currency: amount.currency,
      },
      utm: {},
      user_agent: getHeader(headers, "user-agent"),
    },
  });
}

async function insertSupabaseRow({ env = process.env, fetchFn = fetch, table, row, onConflict }) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { skipped: true, reason: "supabase_not_configured" };
  }

  const endpoint = new URL(`/rest/v1/${table}`, url);
  if (onConflict) {
    endpoint.searchParams.set("on_conflict", onConflict);
  }

  const supabaseResponse = await fetchFn(endpoint.toString(), {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: onConflict ? "resolution=ignore-duplicates,return=minimal" : "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!supabaseResponse.ok) {
    const message = await supabaseResponse.text();
    throw new Error(`supabase_insert_failed:${message}`);
  }

  return { skipped: false };
}

function getConfigError(env = {}) {
  if (!(env.SUPABASE_URL || env.VITE_SUPABASE_URL)) {
    return "missing_supabase_url";
  }
  if (!(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY)) {
    return "missing_supabase_key";
  }
  return null;
}

function getHeader(headers = {}, name) {
  const lowerName = name.toLowerCase();
  const headerName = Object.keys(headers).find((key) => key.toLowerCase() === lowerName);
  return headerName ? headers[headerName] : undefined;
}

function timingSafeEqualHex(candidate, expected) {
  if (!/^[a-f0-9]+$/i.test(candidate) || candidate.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(expected, "hex"));
}

function toBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
}

function response(statusCode, body) {
  return { statusCode, body };
}

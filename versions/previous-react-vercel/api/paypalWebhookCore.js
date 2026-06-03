export const SUPPORTED_PAYPAL_EVENTS = new Set([
  "PAYMENT.CAPTURE.COMPLETED",
  "PAYMENT.CAPTURE.DENIED",
  "PAYMENT.CAPTURE.REFUNDED",
  "PAYMENT.CAPTURE.REVERSED",
]);

export function getPayPalApiBase(env = {}) {
  return String(env.PAYPAL_ENV || "live").toLowerCase() === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

export function buildPayPalVerificationPayload({ env = {}, headers = {}, event }) {
  return {
    auth_algo: getHeader(headers, "paypal-auth-algo"),
    cert_url: getHeader(headers, "paypal-cert-url"),
    transmission_id: getHeader(headers, "paypal-transmission-id"),
    transmission_sig: getHeader(headers, "paypal-transmission-sig"),
    transmission_time: getHeader(headers, "paypal-transmission-time"),
    webhook_id: env.PAYPAL_WEBHOOK_ID,
    webhook_event: event,
  };
}

export function centsFromPayPalAmount(amount = {}) {
  const rawValue = amount.value ?? amount.total;
  const currency = amount.currency_code ?? amount.currency;

  if (!rawValue || !currency) {
    return { amountCents: null, currency: currency || null };
  }

  return {
    amountCents: Math.round(Number(rawValue) * 100),
    currency,
  };
}

export async function handlePayPalWebhook({ event, headers = {}, env = process.env, fetchFn = fetch }) {
  if (!event || typeof event !== "object") {
    return response(400, { ok: false, error: "invalid_event" });
  }

  const eventType = event.event_type || "";

  if (!SUPPORTED_PAYPAL_EVENTS.has(eventType)) {
    return response(200, { ok: true, ignored: true, reason: "unsupported_event_type", event_type: eventType });
  }

  if (hasMissingSignatureHeaders(headers)) {
    return response(400, { ok: false, error: "missing_paypal_signature_headers" });
  }

  const configError = getConfigError(env);
  if (configError) {
    return response(500, { ok: false, error: configError });
  }

  const verification = await verifyPayPalWebhookSignature({ event, headers, env, fetchFn });
  if (!verification.verified) {
    return response(400, { ok: false, error: "signature_verification_failed" });
  }

  const amount = extractCaptureAmount(event);

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
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
    return response(200, { ok: true, recorded: true, event_type: eventType });
  }

  await recordPayPalEventToSupabase({ event, headers, amount, env, fetchFn });
  return response(200, { ok: true, recorded: true, event_type: eventType });
}

export async function verifyPayPalWebhookSignature({ event, headers = {}, env = process.env, fetchFn = fetch }) {
  const accessToken = await getPayPalAccessToken({ env, fetchFn });
  const payload = buildPayPalVerificationPayload({ env, headers, event });
  const verifyResponse = await fetchFn(`${getPayPalApiBase(env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!verifyResponse.ok) {
    return { verified: false };
  }

  const body = await verifyResponse.json();
  return { verified: body.verification_status === "SUCCESS" };
}

async function getPayPalAccessToken({ env = process.env, fetchFn = fetch }) {
  const credentials = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const tokenResponse = await fetchFn(`${getPayPalApiBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    throw new Error("paypal_oauth_failed");
  }

  const body = await tokenResponse.json();
  if (!body.access_token) {
    throw new Error("paypal_oauth_missing_access_token");
  }

  return body.access_token;
}

async function recordPurchaseToSupabase({ event, headers = {}, amount, env = process.env, fetchFn = fetch }) {
  return insertSupabaseRow({
    env,
    fetchFn,
    table: "purchase_events",
    onConflict: "event_id",
    row: {
      event_id: event.id || event.resource?.id || null,
      provider: "paypal",
      amount_cents: amount.amountCents,
      currency: amount.currency,
      source: "paypal_webhook",
      variant: "one-dollar",
      page_path: "/api/paypal-webhook",
      visitor_id: null,
      utm: {},
      user_agent: getHeader(headers, "user-agent"),
    },
  });
}

async function recordPayPalEventToSupabase({ event, headers = {}, amount, env = process.env, fetchFn = fetch }) {
  return insertSupabaseRow({
    env,
    fetchFn,
    table: "landing_events",
    row: {
      event_name: event.event_type,
      source: "paypal_webhook",
      variant: "one-dollar",
      path: "/api/paypal-webhook",
      visitor_id: null,
      payload: {
        paypal_event_id: event.id || null,
        paypal_resource_id: event.resource?.id || null,
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

function extractCaptureAmount(event) {
  const resource = event.resource || {};
  return centsFromPayPalAmount(resource.amount || resource.seller_receivable_breakdown?.gross_amount || {});
}

function getConfigError(env = {}) {
  if (!env.PAYPAL_CLIENT_ID) {
    return "missing_paypal_client_id";
  }
  if (!env.PAYPAL_CLIENT_SECRET) {
    return "missing_paypal_client_secret";
  }
  if (!env.PAYPAL_WEBHOOK_ID) {
    return "missing_paypal_webhook_id";
  }
  if (!(env.SUPABASE_URL || env.VITE_SUPABASE_URL)) {
    return "missing_supabase_url";
  }
  if (!(env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY)) {
    return "missing_supabase_key";
  }
  return null;
}

function hasMissingSignatureHeaders(headers = {}) {
  return [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ].some((name) => !getHeader(headers, name));
}

function getHeader(headers = {}, name) {
  const lowerName = name.toLowerCase();
  const headerName = Object.keys(headers).find((key) => key.toLowerCase() === lowerName);
  return headerName ? headers[headerName] : undefined;
}

function response(statusCode, body) {
  return { statusCode, body };
}

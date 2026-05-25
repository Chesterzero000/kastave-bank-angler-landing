import assert from "node:assert/strict";
import test from "node:test";

import {
  createStripeSignature,
  extractCheckoutSessionAmount,
  handleStripeWebhook,
  verifyStripeSignature,
} from "./stripeWebhookCore.js";

const now = Date.UTC(2026, 4, 23, 0, 0, 0);
const timestamp = Math.floor(now / 1000);
const secret = "whsec_test_secret";

const completedSessionEvent = {
  id: "evt_checkout_completed",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_123",
      amount_total: 100,
      currency: "usd",
      payment_status: "paid",
      client_reference_id: "visitor-123",
    },
  },
};

test("verifyStripeSignature accepts a valid signed raw body", () => {
  const rawBody = JSON.stringify(completedSessionEvent);
  const signatureHeader = sign(rawBody);

  assert.deepEqual(verifyStripeSignature({ rawBody, signatureHeader, secret, now }), { verified: true });
});

test("verifyStripeSignature rejects stale timestamps", () => {
  const rawBody = JSON.stringify(completedSessionEvent);
  const staleTimestamp = timestamp - 301;
  const staleSignature = createStripeSignature({ rawBody, timestamp: staleTimestamp, secret });

  assert.deepEqual(
    verifyStripeSignature({
      rawBody,
      signatureHeader: `t=${staleTimestamp},v1=${staleSignature}`,
      secret,
      now,
    }),
    { verified: false, reason: "timestamp_out_of_tolerance" },
  );
});

test("extractCheckoutSessionAmount normalizes Stripe checkout amount fields", () => {
  assert.deepEqual(extractCheckoutSessionAmount({ amount_total: 100, currency: "usd" }), {
    amountCents: 100,
    currency: "USD",
  });
});

test("handleStripeWebhook rejects requests without the Stripe signature header", async () => {
  const result = await handleStripeWebhook({
    rawBody: JSON.stringify(completedSessionEvent),
    signatureHeader: "",
    env: { STRIPE_WEBHOOK_SECRET: secret },
    now,
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.body.error, "missing_stripe_signature");
});

test("handleStripeWebhook rejects invalid JSON after signature verification", async () => {
  const rawBody = "{not-json";
  const result = await handleStripeWebhook({
    rawBody,
    signatureHeader: sign(rawBody),
    env: { STRIPE_WEBHOOK_SECRET: secret },
    now,
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.body.error, "invalid_json");
});

test("handleStripeWebhook ignores unsupported events before requiring Supabase", async () => {
  let fetchCalls = 0;
  const rawBody = JSON.stringify({ id: "evt_ignore", type: "customer.created", data: { object: {} } });
  const result = await handleStripeWebhook({
    rawBody,
    signatureHeader: sign(rawBody),
    env: { STRIPE_WEBHOOK_SECRET: secret },
    fetchFn: async () => {
      fetchCalls += 1;
      throw new Error("fetch should not be called");
    },
    now,
  });

  assert.equal(fetchCalls, 0);
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ignored, true);
  assert.equal(result.body.reason, "unsupported_event_type");
});

test("handleStripeWebhook rejects supported events when Supabase server env is missing", async () => {
  const rawBody = JSON.stringify(completedSessionEvent);
  const result = await handleStripeWebhook({
    rawBody,
    signatureHeader: sign(rawBody),
    env: { STRIPE_WEBHOOK_SECRET: secret },
    now,
  });

  assert.equal(result.statusCode, 500);
  assert.equal(result.body.error, "missing_supabase_url");
});

test("handleStripeWebhook records a completed one-dollar checkout session", async () => {
  const rawBody = JSON.stringify(completedSessionEvent);
  const requests = [];
  const result = await handleStripeWebhook({
    rawBody,
    signatureHeader: sign(rawBody),
    headers: { "user-agent": "Stripe/1.0" },
    env: {
      STRIPE_WEBHOOK_SECRET: secret,
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    },
    fetchFn: async (url, options = {}) => {
      requests.push({ url, options });
      assert.match(url, /\/rest\/v1\/purchase_events/);
      assert.equal(options.method, "POST");
      assert.equal(options.headers.Authorization, "Bearer service-role");
      const row = JSON.parse(options.body);
      assert.equal(row.event_id, "evt_checkout_completed");
      assert.equal(row.provider, "stripe");
      assert.equal(row.amount_cents, 100);
      assert.equal(row.currency, "USD");
      assert.equal(row.visitor_id, "visitor-123");
      return jsonResponse({}, 201);
    },
    now,
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.recorded, true);
  assert.equal(requests.length, 1);
});

test("handleStripeWebhook ignores paid checkout sessions with the wrong amount", async () => {
  const rawBody = JSON.stringify({
    ...completedSessionEvent,
    data: {
      object: {
        ...completedSessionEvent.data.object,
        amount_total: 200,
      },
    },
  });
  const result = await handleStripeWebhook({
    rawBody,
    signatureHeader: sign(rawBody),
    env: {
      STRIPE_WEBHOOK_SECRET: secret,
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    },
    fetchFn: async () => {
      throw new Error("fetch should not be called");
    },
    now,
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ignored, true);
  assert.equal(result.body.reason, "amount_mismatch");
});

test("handleStripeWebhook records async payment failures as landing events", async () => {
  const failedEvent = {
    ...completedSessionEvent,
    id: "evt_async_failed",
    type: "checkout.session.async_payment_failed",
    data: {
      object: {
        ...completedSessionEvent.data.object,
        payment_status: "unpaid",
      },
    },
  };
  const rawBody = JSON.stringify(failedEvent);
  const result = await handleStripeWebhook({
    rawBody,
    signatureHeader: sign(rawBody),
    env: {
      STRIPE_WEBHOOK_SECRET: secret,
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    },
    fetchFn: async (url, options = {}) => {
      assert.match(url, /\/rest\/v1\/landing_events/);
      assert.equal(JSON.parse(options.body).event_name, "checkout.session.async_payment_failed");
      return jsonResponse({}, 201);
    },
    now,
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.recorded, true);
});

function sign(rawBody) {
  const signature = createStripeSignature({ rawBody, timestamp, secret });
  return `t=${timestamp},v1=${signature}`;
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}

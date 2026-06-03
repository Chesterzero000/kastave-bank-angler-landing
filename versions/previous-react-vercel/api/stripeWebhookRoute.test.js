import assert from "node:assert/strict";
import test from "node:test";

import stripeWebhook from "./stripe-webhook.js";
import { createStripeSignature } from "./stripeWebhookCore.js";

const secret = "whsec_route_secret";
const event = {
  id: "evt_route_completed",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_route_123",
      amount_total: 100,
      currency: "usd",
      payment_status: "paid",
    },
  },
};

test("stripe webhook route exposes a Vercel Web fetch handler", () => {
  assert.equal(typeof stripeWebhook.fetch, "function");
});

test("stripe webhook route rejects non-POST requests", async () => {
  const response = await stripeWebhook.fetch(new Request("https://kastave.com/api/stripe-webhook"));
  const body = await response.json();

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
  assert.deepEqual(body, { ok: false, error: "method_not_allowed" });
});

test("stripe webhook route rejects missing Stripe signatures", async () => {
  const response = await stripeWebhook.fetch(createRequest(JSON.stringify(event), {}));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, { ok: false, error: "missing_stripe_signature" });
});

test("stripe webhook route verifies and records a valid completed checkout", async () => {
  const previousEnv = snapshotEnv();
  const previousFetch = globalThis.fetch;
  const rawBody = JSON.stringify(event);
  const requests = [];

  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.includes("/rest/v1/purchase_events")) {
      return jsonResponse({}, 201);
    }
    throw new Error(`unexpected fetch: ${url}`);
  };

  Object.assign(process.env, {
    STRIPE_WEBHOOK_SECRET: secret,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
  });

  try {
    const response = await stripeWebhook.fetch(
      createRequest(rawBody, { "stripe-signature": sign(rawBody), "user-agent": "Stripe/1.0" }),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.recorded, true);
    assert.equal(requests.length, 1);
  } finally {
    restoreEnv(previousEnv);
    globalThis.fetch = previousFetch;
  }
});

test("stripe webhook route returns invalid_json for a signed malformed body", async () => {
  const previousEnv = snapshotEnv();
  Object.assign(process.env, { STRIPE_WEBHOOK_SECRET: secret });

  try {
    const rawBody = "{not-json";
    const response = await stripeWebhook.fetch(createRequest(rawBody, { "stripe-signature": sign(rawBody) }));
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(body, { ok: false, error: "invalid_json" });
  } finally {
    restoreEnv(previousEnv);
  }
});

function createRequest(body, headers = {}) {
  return new Request("https://kastave.com/api/stripe-webhook", {
    method: "POST",
    headers,
    body,
  });
}

function sign(rawBody) {
  const nowTimestamp = Math.floor(Date.now() / 1000);
  const signature = createStripeSignature({ rawBody, timestamp: nowTimestamp, secret });
  return `t=${nowTimestamp},v1=${signature}`;
}

function snapshotEnv() {
  return {
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function restoreEnv(snapshot) {
  Object.entries(snapshot).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
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

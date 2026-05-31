import assert from "node:assert/strict";
import test from "node:test";

import paypalWebhook from "./paypal-webhook.js";

const event = {
  id: "WH-ROUTE-TEST",
  event_type: "PAYMENT.CAPTURE.COMPLETED",
  resource: {
    id: "CAPTURE-ROUTE",
    amount: {
      value: "1.00",
      currency_code: "USD",
    },
  },
};

const paypalHeaders = {
  "paypal-auth-algo": "SHA256withRSA",
  "paypal-cert-url": "https://api-m.paypal.com/certs/test",
  "paypal-transmission-id": "route-abc-123",
  "paypal-transmission-sig": "signature",
  "paypal-transmission-time": "2026-05-20T00:00:00Z",
};

test("paypal webhook route exposes a Vercel Web fetch handler", () => {
  assert.equal(typeof paypalWebhook.fetch, "function");
});

test("paypal webhook route rejects non-POST requests", async () => {
  const response = await paypalWebhook.fetch(new Request("https://kastave.com/api/paypal-webhook"));
  const body = await response.json();

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
  assert.deepEqual(body, { ok: false, error: "method_not_allowed" });
});

test("paypal webhook route rejects invalid JSON", async () => {
  const response = await paypalWebhook.fetch(createRequest("{not-json"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, { ok: false, error: "invalid_json" });
});

test("paypal webhook route verifies and records a valid completed capture", async () => {
  const previousEnv = snapshotEnv();
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.endsWith("/v1/oauth2/token")) {
      return jsonResponse({ access_token: "paypal-access-token" });
    }
    if (url.endsWith("/v1/notifications/verify-webhook-signature")) {
      return jsonResponse({ verification_status: "SUCCESS" });
    }
    if (url.includes("/rest/v1/purchase_events")) {
      return jsonResponse({}, 201);
    }
    throw new Error(`unexpected fetch: ${url}`);
  };

  Object.assign(process.env, {
    PAYPAL_CLIENT_ID: "client-id",
    PAYPAL_CLIENT_SECRET: "client-secret",
    PAYPAL_WEBHOOK_ID: "WH-ID",
    PAYPAL_ENV: "live",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
  });

  try {
    const response = await paypalWebhook.fetch(createRequest(JSON.stringify(event), paypalHeaders));
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.recorded, true);
    assert.equal(requests.length, 3);
  } finally {
    restoreEnv(previousEnv);
    globalThis.fetch = previousFetch;
  }
});

function createRequest(body, headers = {}) {
  return new Request("https://kastave.com/api/paypal-webhook", {
    method: "POST",
    headers,
    body,
  });
}

function snapshotEnv() {
  return {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
    PAYPAL_ENV: process.env.PAYPAL_ENV,
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

import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPayPalVerificationPayload,
  centsFromPayPalAmount,
  getPayPalApiBase,
  handlePayPalWebhook,
} from "./paypalWebhookCore.js";

const headers = {
  "paypal-auth-algo": "SHA256withRSA",
  "paypal-cert-url": "https://api-m.paypal.com/certs/test",
  "paypal-transmission-id": "abc-123",
  "paypal-transmission-sig": "signature",
  "paypal-transmission-time": "2026-05-20T00:00:00Z",
  "user-agent": "PayPal/AUHR-214.0-56844112",
};

const completedCaptureEvent = {
  id: "WH-TEST-COMPLETED",
  event_type: "PAYMENT.CAPTURE.COMPLETED",
  resource: {
    id: "CAPTURE-123",
    amount: {
      value: "1.00",
      currency_code: "USD",
    },
  },
};

test("getPayPalApiBase chooses live by default and sandbox when requested", () => {
  assert.equal(getPayPalApiBase({}), "https://api-m.paypal.com");
  assert.equal(getPayPalApiBase({ PAYPAL_ENV: "live" }), "https://api-m.paypal.com");
  assert.equal(getPayPalApiBase({ PAYPAL_ENV: "sandbox" }), "https://api-m.sandbox.paypal.com");
});

test("buildPayPalVerificationPayload maps PayPal transmission headers", () => {
  assert.deepEqual(
    buildPayPalVerificationPayload({
      env: { PAYPAL_WEBHOOK_ID: "WH-ID" },
      headers,
      event: completedCaptureEvent,
    }),
    {
      auth_algo: "SHA256withRSA",
      cert_url: "https://api-m.paypal.com/certs/test",
      transmission_id: "abc-123",
      transmission_sig: "signature",
      transmission_time: "2026-05-20T00:00:00Z",
      webhook_id: "WH-ID",
      webhook_event: completedCaptureEvent,
    },
  );
});

test("centsFromPayPalAmount handles PayPal v2 and v1 amount shapes", () => {
  assert.deepEqual(centsFromPayPalAmount({ value: "1.00", currency_code: "USD" }), {
    amountCents: 100,
    currency: "USD",
  });
  assert.deepEqual(centsFromPayPalAmount({ total: "7.47", currency: "USD" }), {
    amountCents: 747,
    currency: "USD",
  });
});

test("handlePayPalWebhook ignores unsupported events before calling PayPal", async () => {
  let fetchCalls = 0;
  const result = await handlePayPalWebhook({
    event: { id: "WH-IGNORE", event_type: "BILLING.SUBSCRIPTION.CREATED", resource: {} },
    headers,
    env: {},
    fetchFn: async () => {
      fetchCalls += 1;
      throw new Error("fetch should not be called");
    },
  });

  assert.equal(fetchCalls, 0);
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ignored, true);
  assert.equal(result.body.reason, "unsupported_event_type");
});

test("handlePayPalWebhook rejects supported events without PayPal signature headers before calling PayPal", async () => {
  let fetchCalls = 0;
  const result = await handlePayPalWebhook({
    event: completedCaptureEvent,
    headers: {},
    env: {
      PAYPAL_CLIENT_ID: "client-id",
      PAYPAL_CLIENT_SECRET: "client-secret",
      PAYPAL_WEBHOOK_ID: "WH-ID",
    },
    fetchFn: async () => {
      fetchCalls += 1;
      throw new Error("fetch should not be called");
    },
  });

  assert.equal(fetchCalls, 0);
  assert.equal(result.statusCode, 400);
  assert.equal(result.body.error, "missing_paypal_signature_headers");
});

test("handlePayPalWebhook rejects supported events when Supabase server env is missing", async () => {
  let fetchCalls = 0;
  const result = await handlePayPalWebhook({
    event: completedCaptureEvent,
    headers,
    env: {
      PAYPAL_CLIENT_ID: "client-id",
      PAYPAL_CLIENT_SECRET: "client-secret",
      PAYPAL_WEBHOOK_ID: "WH-ID",
    },
    fetchFn: async () => {
      fetchCalls += 1;
      throw new Error("fetch should not be called");
    },
  });

  assert.equal(fetchCalls, 0);
  assert.equal(result.statusCode, 500);
  assert.equal(result.body.error, "missing_supabase_url");
});

test("handlePayPalWebhook verifies signature and records a completed one-dollar capture", async () => {
  const requests = [];
  const result = await handlePayPalWebhook({
    event: completedCaptureEvent,
    headers,
    env: {
      PAYPAL_CLIENT_ID: "client-id",
      PAYPAL_CLIENT_SECRET: "client-secret",
      PAYPAL_WEBHOOK_ID: "WH-ID",
      PAYPAL_ENV: "live",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    },
    fetchFn: async (url, options = {}) => {
      requests.push({ url, options });
      if (url.endsWith("/v1/oauth2/token")) {
        return jsonResponse({ access_token: "paypal-access-token" });
      }
      if (url.endsWith("/v1/notifications/verify-webhook-signature")) {
        return jsonResponse({ verification_status: "SUCCESS" });
      }
      if (url.includes("/rest/v1/purchase_events")) {
        assert.equal(options.method, "POST");
        assert.equal(options.headers.Authorization, "Bearer service-role");
        assert.equal(JSON.parse(options.body).event_id, "WH-TEST-COMPLETED");
        assert.equal(JSON.parse(options.body).amount_cents, 100);
        assert.equal(JSON.parse(options.body).currency, "USD");
        return jsonResponse({}, 201);
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.recorded, true);
  assert.equal(requests.length, 3);
});

test("handlePayPalWebhook rejects completed captures with the wrong amount", async () => {
  const result = await handlePayPalWebhook({
    event: {
      ...completedCaptureEvent,
      resource: {
        ...completedCaptureEvent.resource,
        amount: { value: "2.00", currency_code: "USD" },
      },
    },
    headers,
    env: {
      PAYPAL_CLIENT_ID: "client-id",
      PAYPAL_CLIENT_SECRET: "client-secret",
      PAYPAL_WEBHOOK_ID: "WH-ID",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
    },
    fetchFn: async (url) => {
      if (url.endsWith("/v1/oauth2/token")) {
        return jsonResponse({ access_token: "paypal-access-token" });
      }
      if (url.endsWith("/v1/notifications/verify-webhook-signature")) {
        return jsonResponse({ verification_status: "SUCCESS" });
      }
      throw new Error(`unexpected fetch: ${url}`);
    },
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ignored, true);
  assert.equal(result.body.reason, "amount_mismatch");
});

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

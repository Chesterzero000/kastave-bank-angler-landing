import assert from "node:assert/strict";
import test from "node:test";

import { validateProductionEnv } from "./checkProductionEnvCore.mjs";

const requiredSampleEnv = {
  VITE_STRIPE_PAYMENT_LINK: "https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00",
  VITE_PAYPAL_PAYMENT_LINK: "https://www.paypal.com/ncp/payment/TESTPAYPALLINK",
  VITE_META_PIXEL_ID: "1542765323857764",
  STRIPE_WEBHOOK_SECRET: "whsec_test_nonsecret",
  PAYPAL_CLIENT_ID: "fake-client-id",
  PAYPAL_CLIENT_SECRET: "fake-client-secret",
  PAYPAL_WEBHOOK_ID: "fake-webhook-id",
  PAYPAL_ENV: "live",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "fake-service-role-key",
};

test("validateProductionEnv reports all missing required production variables", () => {
  const result = validateProductionEnv({});

  assert.equal(result.failures.length, 10);
  assert.match(result.failures.join("\n"), /VITE_STRIPE_PAYMENT_LINK is missing/);
  assert.match(result.failures.join("\n"), /STRIPE_WEBHOOK_SECRET is missing/);
  assert.match(result.failures.join("\n"), /SUPABASE_SERVICE_ROLE_KEY is missing/);
  assert.match(result.warnings.join("\n"), /VITE_SUPABASE_URL is missing/);
});

test("validateProductionEnv passes required sample values and warns for recommended analytics values", () => {
  const result = validateProductionEnv(requiredSampleEnv);

  assert.deepEqual(result.failures, []);
  assert.match(result.warnings.join("\n"), /VITE_SUPABASE_URL is missing/);
  assert.match(result.warnings.join("\n"), /VITE_BEEHIIV_FORM_URL is missing/);
});

test("validateProductionEnv rejects wrong hosts, placeholders, and invalid modes", () => {
  const result = validateProductionEnv({
    ...requiredSampleEnv,
    VITE_STRIPE_PAYMENT_LINK: "https://example.com/pay",
    VITE_PAYPAL_PAYMENT_LINK: "not-a-url",
    VITE_META_PIXEL_ID: "pixel-id",
    STRIPE_WEBHOOK_SECRET: "your-secret",
    PAYPAL_CLIENT_ID: "replace-with-client-id",
    PAYPAL_ENV: "production",
  });

  const failures = result.failures.join("\n");
  assert.match(failures, /VITE_STRIPE_PAYMENT_LINK: expected hostname buy\.stripe\.com/);
  assert.match(failures, /VITE_PAYPAL_PAYMENT_LINK: expected a valid URL/);
  assert.match(failures, /VITE_META_PIXEL_ID: expected numeric Meta Pixel ID/);
  assert.match(failures, /STRIPE_WEBHOOK_SECRET still looks like a placeholder/);
  assert.match(failures, /PAYPAL_CLIENT_ID still looks like a placeholder/);
  assert.match(failures, /PAYPAL_ENV: expected live or sandbox/);
});

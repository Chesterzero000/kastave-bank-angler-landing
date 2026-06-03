import { join } from "node:path";
import { loadProductionEnv, readEnvFile } from "./env-file.mjs";

const root = process.cwd();

try {
  const { env, loadedPath } = await loadProductionEnv();
  const paymentLinks = await getPaymentLinks(env);

  if (loadedPath) {
    console.log(`Loaded production env file: ${loadedPath}`);
  }

  await verifyPaymentLink({
    label: "Stripe",
    url: paymentLinks.stripe,
    allowedHosts: new Set(["buy.stripe.com"]),
  });

  await verifyPaymentLink({
    label: "PayPal",
    url: paymentLinks.paypal,
    allowedHosts: new Set(["www.paypal.com", "paypal.com"]),
  });

  console.log("Payment links verified.");
} catch (error) {
  console.error(`Payment link check failed: ${error.message}`);
  process.exit(1);
}

async function getPaymentLinks(env) {
  const envExample = await readEnvFile(join(root, ".env.example"));

  return {
    stripe: env.VITE_STRIPE_PAYMENT_LINK || envExample.VITE_STRIPE_PAYMENT_LINK,
    paypal: env.VITE_PAYPAL_PAYMENT_LINK || envExample.VITE_PAYPAL_PAYMENT_LINK,
  };
}

async function verifyPaymentLink({ label, url, allowedHosts }) {
  if (!url) {
    throw new Error(`${label} payment link is missing.`);
  }

  const parsed = parsePaymentUrl(label, url, allowedHosts);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(parsed, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      },
    });
    const body = await response.text();
    const recognizablePaymentPage = isRecognizablePaymentPage(label, body);

    if (!response.ok) {
      throw new Error(`${label} payment link returned HTTP ${response.status}.`);
    }

    if (isMerchantErrorPage(body) && !recognizablePaymentPage) {
      throw new Error(`${label} payment link appears to show a merchant/payment setup error page.`);
    }

    if (!recognizablePaymentPage) {
      throw new Error(`${label} payment link did not return recognizable ${label} checkout content.`);
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`${label} payment link timed out.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parsePaymentUrl(label, value, allowedHosts) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} payment link is not a valid URL.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} payment link must use HTTPS.`);
  }

  if (!allowedHosts.has(url.hostname)) {
    throw new Error(`${label} payment link host is not allowed: ${url.hostname}`);
  }

  return url;
}

function isMerchantErrorPage(body) {
  return [
    /Something went wrong/i,
    /Contact the merchant/i,
    /payment link is no longer/i,
    /Things don't appear to be working/i,
    /This page is unavailable/i,
  ].some((pattern) => pattern.test(body));
}

function isRecognizablePaymentPage(label, body) {
  if (label === "PayPal") {
    return [
      /hostedButtonDetails/i,
      /"status":"ACTIVE"/i,
      /Kastave \$1 Founder Reservation/i,
      /"amount","value":"1\.00"/i,
      /"payment_button_type","value":"LINK"/i,
    ].every((pattern) => pattern.test(body));
  }

  return body.toLowerCase().includes(label.toLowerCase());
}

import { handleStripeWebhook } from "./stripeWebhookCore.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse(405, { ok: false, error: "method_not_allowed" }, { Allow: "POST" });
    }

    try {
      const rawBody = await request.text();
      const result = await handleStripeWebhook({
        rawBody,
        signatureHeader: request.headers.get("stripe-signature"),
        headers: Object.fromEntries(request.headers.entries()),
        env: process.env,
        fetchFn: fetch,
      });

      return jsonResponse(result.statusCode, result.body);
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        error: "stripe_webhook_handler_failed",
        detail: error instanceof Error ? error.message : "unknown_error",
      });
    }
  },
};

function jsonResponse(status, body, headers = {}) {
  return Response.json(body, { status, headers });
}

import { handlePayPalWebhook } from "./paypalWebhookCore.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse(405, { ok: false, error: "method_not_allowed" }, { Allow: "POST" });
    }

    let event;
    try {
      event = await request.json();
    } catch {
      return jsonResponse(400, { ok: false, error: "invalid_json" });
    }

    try {
      const result = await handlePayPalWebhook({
        event,
        headers: Object.fromEntries(request.headers.entries()),
        env: process.env,
        fetchFn: fetch,
      });

      return jsonResponse(result.statusCode, result.body);
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        error: "paypal_webhook_handler_failed",
        detail: error instanceof Error ? error.message : "unknown_error",
      });
    }
  },
};

function jsonResponse(status, body, headers = {}) {
  return Response.json(body, { status, headers });
}

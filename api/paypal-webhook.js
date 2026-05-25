import { handlePayPalWebhook } from "./paypalWebhookCore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let event;
  try {
    event = await readJsonBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: "invalid_json" });
  }

  try {
    const result = await handlePayPalWebhook({
      event,
      headers: req.headers || {},
      env: process.env,
      fetchFn: fetch,
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "paypal_webhook_handler_failed",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

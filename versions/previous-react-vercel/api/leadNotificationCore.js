const RESEND_API_URL = "https://api.resend.com/emails";

export async function handleLeadNotification({ request, env = {}, fetchFn = fetch } = {}) {
  if (!request || request.method !== "POST") {
    return {
      statusCode: 405,
      body: { ok: false, error: "method_not_allowed" },
      headers: { Allow: "POST" },
    };
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return { statusCode: 400, body: { ok: false, error: "invalid_json" } };
  }

  const email = normalizeEmail(payload.email);
  if (!email) {
    return { statusCode: 400, body: { ok: false, error: "invalid_email" } };
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const notifyTo = env.LEAD_NOTIFY_TO?.trim();
  const notifyFrom = env.LEAD_NOTIFY_FROM?.trim();

  if (!apiKey || !notifyTo || !notifyFrom) {
    return {
      statusCode: 202,
      body: { ok: true, sent: false, reason: "email_notification_not_configured" },
    };
  }

  const source = cleanText(payload.source || "unknown", 80);
  const pagePath = cleanText(payload.pagePath || payload.page_path || "unknown", 160);
  const variant = cleanText(payload.variant || "unknown", 80);
  const visitorId = cleanText(payload.visitorId || payload.visitor_id || "unknown", 120);
  const createdAt = new Date().toISOString();

  const resendResponse = await fetchFn(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: notifyFrom,
      to: [notifyTo],
      subject: `New Kastave email signup: ${email}`,
      text: [
        "New Kastave waitlist signup",
        "",
        `Email: ${email}`,
        `Source: ${source}`,
        `Page: ${pagePath}`,
        `Variant: ${variant}`,
        `Visitor ID: ${visitorId}`,
        `Time: ${createdAt}`,
      ].join("\n"),
      html: buildEmailHtml({ email, source, pagePath, variant, visitorId, createdAt }),
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    return {
      statusCode: 502,
      body: {
        ok: false,
        error: "email_notification_failed",
        detail: detail.slice(0, 240),
      },
    };
  }

  return { statusCode: 200, body: { ok: true, sent: true } };
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 254) {
    return "";
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function buildEmailHtml({ email, source, pagePath, variant, visitorId, createdAt }) {
  return `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #111715;">
    <h1 style="font-size: 22px;">New Kastave waitlist signup</h1>
    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(source)}</td></tr>
      <tr><td><strong>Page</strong></td><td>${escapeHtml(pagePath)}</td></tr>
      <tr><td><strong>Variant</strong></td><td>${escapeHtml(variant)}</td></tr>
      <tr><td><strong>Visitor ID</strong></td><td>${escapeHtml(visitorId)}</td></tr>
      <tr><td><strong>Time</strong></td><td>${escapeHtml(createdAt)}</td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

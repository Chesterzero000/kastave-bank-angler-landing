import assert from "node:assert/strict";
import test from "node:test";

import { handleLeadNotification } from "./leadNotificationCore.js";

test("lead notification sends waitlist email through Resend", async () => {
  const requests = [];
  const response = await handleLeadNotification({
    request: createRequest({
      email: " NewLead@Example.com ",
      source: "hero",
      pagePath: "/",
      variant: "one-dollar",
      visitorId: "visitor-1",
    }),
    env: {
      RESEND_API_KEY: "re_test_key",
      LEAD_NOTIFY_TO: "founder@kastave.com",
      LEAD_NOTIFY_FROM: "Kastave <notify@kastave.com>",
    },
    fetchFn: async (url, options = {}) => {
      requests.push({ url, options });
      return Response.json({ id: "email_123" }, { status: 200 });
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true, sent: true });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.resend.com/emails");
  assert.equal(requests[0].options.headers.Authorization, "Bearer re_test_key");

  const body = JSON.parse(requests[0].options.body);
  assert.deepEqual(body.to, ["founder@kastave.com"]);
  assert.equal(body.from, "Kastave <notify@kastave.com>");
  assert.match(body.subject, /newlead@example\.com/i);
  assert.match(body.text, /Source: hero/);
});

test("lead notification is non-blocking when email env is missing", async () => {
  const response = await handleLeadNotification({
    request: createRequest({ email: "lead@example.com" }),
    env: {},
    fetchFn: async () => {
      throw new Error("should not call resend");
    },
  });

  assert.equal(response.statusCode, 202);
  assert.deepEqual(response.body, {
    ok: true,
    sent: false,
    reason: "email_notification_not_configured",
  });
});

test("lead notification rejects invalid emails", async () => {
  const response = await handleLeadNotification({
    request: createRequest({ email: "not-an-email" }),
    env: {
      RESEND_API_KEY: "re_test_key",
      LEAD_NOTIFY_TO: "founder@kastave.com",
      LEAD_NOTIFY_FROM: "Kastave <notify@kastave.com>",
    },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { ok: false, error: "invalid_email" });
});

function createRequest(body) {
  return new Request("https://kastave.com/api/lead-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

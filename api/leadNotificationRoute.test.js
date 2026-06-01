import assert from "node:assert/strict";
import test from "node:test";

import leadNotification from "./lead-notification.js";

test("lead notification route exposes a Vercel Web fetch handler", () => {
  assert.equal(typeof leadNotification.fetch, "function");
});

test("lead notification route rejects non-POST requests", async () => {
  const response = await leadNotification.fetch(new Request("https://kastave.com/api/lead-notification"));
  const body = await response.json();

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
  assert.deepEqual(body, { ok: false, error: "method_not_allowed" });
});

test("lead notification route accepts a configured signup notification", async () => {
  const previousEnv = snapshotEnv();
  const previousFetch = globalThis.fetch;
  const requests = [];

  Object.assign(process.env, {
    RESEND_API_KEY: "re_test_key",
    LEAD_NOTIFY_TO: "founder@kastave.com",
    LEAD_NOTIFY_FROM: "Kastave <notify@kastave.com>",
  });

  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return Response.json({ id: "email_route_123" }, { status: 200 });
  };

  try {
    const response = await leadNotification.fetch(
      new Request("https://kastave.com/api/lead-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "lead@example.com", source: "hero" }),
      }),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true, sent: true });
    assert.equal(requests.length, 1);
  } finally {
    restoreEnv(previousEnv);
    globalThis.fetch = previousFetch;
  }
});

function snapshotEnv() {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEAD_NOTIFY_TO: process.env.LEAD_NOTIFY_TO,
    LEAD_NOTIFY_FROM: process.env.LEAD_NOTIFY_FROM,
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

import { getExperimentVariant } from "./supabaseBackend.js";

export function notifyLeadSignup(email, properties = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return Promise.resolve();
  }

  const payload = {
    email: normalizedEmail,
    source: properties.source || "inline_form",
    pagePath: window.location.pathname,
    variant: getExperimentVariant(),
    visitorId: localStorage.getItem("kastave_visitor_id") || "",
  };

  return fetch("/api/lead-notification", {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Email notification should never block lead capture or checkout navigation.
  });
}

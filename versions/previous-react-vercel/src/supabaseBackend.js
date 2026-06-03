import { ATTRIBUTION_KEYS } from "./analyticsCore.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const DEFAULT_VARIANT = "one-dollar";

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getExperimentVariant() {
  const params = new URLSearchParams(window.location.search);
  const variant = sanitizeVariant(params.get("variant"));

  if (variant) {
    localStorage.setItem("kastave_variant", variant);
    return variant;
  }

  return localStorage.getItem("kastave_variant") || DEFAULT_VARIANT;
}

export function recordAnalyticsEvent(name, properties = {}) {
  return insertRow("landing_events", {
    event_name: name,
    source: properties.source || null,
    variant: getExperimentVariant(),
    path: window.location.pathname,
    visitor_id: getVisitorId(),
    payload: properties,
    utm: extractUtm(properties),
    user_agent: navigator.userAgent,
  });
}

export function recordWaitlistSignup(email, properties = {}) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return Promise.resolve();
  }

  return insertRow("waitlist_signups", {
    email: normalizedEmail,
    source: properties.source || "inline_form",
    variant: getExperimentVariant(),
    page_path: window.location.pathname,
    visitor_id: getVisitorId(),
    utm: extractUtm(properties),
    user_agent: navigator.userAgent,
  });
}

export function recordReservationIntent({
  amountCents = 100,
  refundable = false,
  provider = "paypal",
  source = "unknown",
  paymentLink = "",
} = {}) {
  return insertRow("reservation_intents", {
    provider,
    amount_cents: amountCents,
    refundable,
    source,
    variant: getExperimentVariant(),
    payment_link: paymentLink,
    page_path: window.location.pathname,
    visitor_id: getVisitorId(),
    utm: extractUtm({}),
    user_agent: navigator.userAgent,
  });
}

function insertRow(table, row) {
  if (!isSupabaseConfigured()) {
    return Promise.resolve();
  }

  return fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  }).catch(() => {
    // Analytics should never block the landing page or checkout navigation.
  });
}

function getVisitorId() {
  const existing = localStorage.getItem("kastave_visitor_id");

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem("kastave_visitor_id", id);
  return id;
}

function extractUtm(properties) {
  const utm = getStoredUtm();

  ATTRIBUTION_KEYS.forEach((key) => {
    const value = properties[key];
    if (value) {
      utm[key] = value;
    }
  });

  return utm;
}

function getStoredUtm() {
  try {
    return JSON.parse(localStorage.getItem("kastave_utm") || "{}");
  } catch {
    return {};
  }
}

function sanitizeVariant(value) {
  if (!value) {
    return "";
  }

  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 48);
}

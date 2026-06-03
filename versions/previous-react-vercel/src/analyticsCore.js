export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export const ATTRIBUTION_KEYS = [
  ...UTM_KEYS,
  "fbclid",
  "gclid",
  "ttclid",
  "creative_id",
  "creative_hook",
  "creative_format",
  "creative_version",
  "audience_name",
  "landing_variant",
];

const HOOK_ALIASES = [
  ["scan_before_cast", ["scan_before_cast", "scan-before-cast", "scanbeforecast"]],
  ["stop_guessing", ["stop_guessing", "stop-guessing", "dead_water", "dead-water"]],
  ["no_boat", ["no_boat", "no-boat", "better_intel", "better-intel"]],
  ["find_structure", ["find_structure", "find-structure", "structure"]],
  ["ai_fishing_plan", ["ai_fishing_plan", "ai-fishing-plan", "ai_plan", "ai-plan"]],
  ["private_waypoints", ["private_waypoints", "private-waypoints", "privacy", "private"]],
  ["early_access_1usd", ["early_access_1usd", "early-access-1usd", "1usd", "reserve"]],
];

export function parseAttribution(search = "", stored = {}) {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const captured = {};

  ATTRIBUTION_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      captured[key] = sanitizeParam(value);
    }
  });

  const attribution = {
    ...stored,
    ...captured,
  };

  const inferred = inferCreativeMetadata(attribution.utm_content || "");
  return {
    ...inferred,
    ...attribution,
  };
}

export function inferCreativeMetadata(utmContent = "") {
  const normalized = sanitizeParam(utmContent).toLowerCase();
  if (!normalized) {
    return {};
  }

  const metadata = {};
  const parts = normalized.split(/[_-]+/).filter(Boolean);
  const format = parts.find((part) => ["1x1", "4x5", "9x16", "story", "feed", "reels"].includes(part));
  const version = parts.find((part) => /^v\d+$/.test(part));
  const hook = HOOK_ALIASES.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0];

  if (hook) {
    metadata.creative_hook = hook;
  }
  if (format) {
    metadata.creative_format = format;
  }
  if (version) {
    metadata.creative_version = version;
  }
  if (!metadata.creative_id) {
    metadata.creative_id = normalized;
  }

  return metadata;
}

export function buildEventPayload(name, properties = {}, context = {}) {
  const attribution = context.attribution || {};
  const eventId = properties.event_id || createEventId(name, context.now || new Date());

  return {
    event_name: name,
    event_id: eventId,
    event_time: Math.floor((context.now || new Date()).getTime() / 1000),
    page_path: context.path || "/",
    page_url: context.url || "",
    page_title: context.title || "",
    referrer: context.referrer || "",
    device_type: context.deviceType || "unknown",
    ...attribution,
    ...properties,
    event_id: eventId,
  };
}

export function getMetaEventName(name, standardEvent) {
  if (standardEvent) {
    return standardEvent;
  }

  const eventMap = {
    page_view: "PageView",
    view_content: "ViewContent",
    lead_intent: "LeadIntent",
    lead: "Lead",
    initiate_checkout: "InitiateCheckout",
    purchase: "Purchase",
  };

  return eventMap[name] || null;
}

export function isMetaStandardEvent(name) {
  return ["PageView", "ViewContent", "Lead", "InitiateCheckout", "Purchase"].includes(name);
}

function createEventId(name, now) {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2);
  return `${name}_${now.getTime()}_${random}`;
}

function sanitizeParam(value) {
  return String(value).trim().slice(0, 256);
}

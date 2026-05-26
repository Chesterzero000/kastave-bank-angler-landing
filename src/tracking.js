import { recordAnalyticsEvent } from "./supabaseBackend.js";
import {
  ATTRIBUTION_KEYS,
  buildEventPayload,
  getMetaEventName,
  isMetaStandardEvent,
  parseAttribution,
} from "./analyticsCore.js";

let engagementStartedAt = 0;
let engagementTrackingReady = false;
let engagementSent = false;
let observedSectionIds = new Set();
let analyticsInitialized = false;

const DEFAULT_META_PIXEL_ID = "1542765323857764";

export function captureUtmParams() {
  const captured = parseAttribution(window.location.search, getStoredUtm());

  if (Object.keys(captured).length > 0) {
    localStorage.setItem("kastave_utm", JSON.stringify(captured));
  }

  return getStoredUtm();
}

export function getStoredUtm() {
  try {
    return JSON.parse(localStorage.getItem("kastave_utm") || "{}");
  } catch {
    return {};
  }
}

export function withUtm(url) {
  if (!url) {
    return "";
  }

  const utm = getStoredUtm();
  const target = new URL(url, window.location.origin);

  Object.entries(utm).forEach(([key, value]) => {
    if (value && !target.searchParams.has(key)) {
      target.searchParams.set(key, value);
    }
  });

  return target.toString();
}

export function initAnalytics() {
  if (analyticsInitialized) {
    return;
  }

  analyticsInitialized = true;
  captureUtmParams();

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const metaPixelId = String(import.meta.env.VITE_META_PIXEL_ID || DEFAULT_META_PIXEL_ID).trim();
  const tiktokPixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID;
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

  if (gaId) {
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, true);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }

  if (metaPixelId) {
    window.fbq =
      window.fbq ||
      function fbq() {
        window.fbq.callMethod
          ? window.fbq.callMethod.apply(window.fbq, arguments)
          : window.fbq.queue.push(arguments);
      };
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];
    appendScript("https://connect.facebook.net/en_US/fbevents.js", true);
    window.fbq("init", metaPixelId);
  }

  if (tiktokPixelId) {
    window.TiktokAnalyticsObject = "ttq";
    const ttq = (window.ttq = window.ttq || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];
    ttq.setAndDefer = (target, method) => {
      target[method] = function deferredMethod() {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    ttq.methods.forEach((method) => ttq.setAndDefer(ttq, method));
    appendScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${tiktokPixelId}&lib=ttq`, true);
    ttq.page();
  }

  if (plausibleDomain) {
    const script = appendScript("https://plausible.io/js/script.js", true);
    script.setAttribute("data-domain", plausibleDomain);
    window.plausible =
      window.plausible ||
      function plausible() {
        window.plausible.q = window.plausible.q || [];
        window.plausible.q.push(arguments);
      };
  }

  startEngagementTracking();
  startSectionTracking();
  trackEvent("page_view", {}, { standardEvent: "PageView" });
}

export function trackEvent(name, properties = {}, options = {}) {
  const payload = buildEventPayload(name, properties, getPageContext());
  const metaEventName = getMetaEventName(name, options.standardEvent);

  recordAnalyticsEvent(name, payload);
  sendServerTrackingEvent(metaEventName || name, payload);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });

  if (window.gtag) {
    window.gtag("event", name, payload);
  }

  if (window.fbq) {
    if (metaEventName && isMetaStandardEvent(metaEventName)) {
      window.fbq("track", metaEventName, payload, { eventID: payload.event_id });
    } else {
      window.fbq("trackCustom", metaEventName || name, payload, { eventID: payload.event_id });
    }
  }

  if (window.ttq?.track) {
    window.ttq.track(name, payload);
  }

  if (window.plausible) {
    window.plausible(name, { props: payload });
  }
}

export function trackLeadIntent(properties = {}) {
  trackEvent("lead_intent", properties, { standardEvent: "LeadIntent" });
}

export function trackLead(properties = {}) {
  trackEvent("lead", properties, { standardEvent: "Lead" });
}

export function trackInitiateCheckout(properties = {}) {
  trackEvent("initiate_checkout", properties, { standardEvent: "InitiateCheckout" });
}

export function trackPurchase(properties = {}) {
  trackEvent("purchase", properties, { standardEvent: "Purchase" });
}

export function trackViewContent(section, properties = {}) {
  trackEvent("view_content", { section, ...properties }, { standardEvent: "ViewContent" });
}

function appendScript(src, async = false) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return existing;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = async;
  document.head.appendChild(script);
  return script;
}

function startEngagementTracking() {
  if (engagementTrackingReady) {
    return;
  }

  engagementTrackingReady = true;
  engagementStartedAt = Date.now();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendEngagementEvent("visibility_hidden");
    }
  });

  window.addEventListener("pagehide", () => sendEngagementEvent("pagehide"));
}

function startSectionTracking() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  observedSectionIds = new Set();
  const sections = Array.from(document.querySelectorAll("main section[id], .hero"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) {
          return;
        }

        const section = entry.target.id || "hero";
        if (observedSectionIds.has(section)) {
          return;
        }

        observedSectionIds.add(section);
        trackViewContent(section, {
          section_label: entry.target.getAttribute("aria-label") || entry.target.getAttribute("aria-labelledby") || section,
        });
      });
    },
    { threshold: [0.35, 0.6] },
  );

  sections.forEach((section) => observer.observe(section));
}

function sendEngagementEvent(reason) {
  if (engagementSent || !engagementStartedAt) {
    return;
  }

  const durationMs = Date.now() - engagementStartedAt;
  if (durationMs < 1000) {
    return;
  }

  engagementSent = true;
  trackEvent("page_engagement", {
    reason,
    duration_ms: durationMs,
    duration_seconds: Number((durationMs / 1000).toFixed(2)),
    path: window.location.pathname,
  });
}

function getPageContext() {
  return {
    attribution: getStoredUtm(),
    path: window.location.pathname,
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
    deviceType: getDeviceType(),
  };
}

function getDeviceType() {
  const width = window.innerWidth || 0;
  if (width < 768) {
    return "mobile";
  }
  if (width < 1024) {
    return "tablet";
  }
  return "desktop";
}

function sendServerTrackingEvent(metaEventName, payload) {
  const endpoint = import.meta.env.VITE_META_CAPI_ENDPOINT || import.meta.env.VITE_TRACKING_ENDPOINT || "";
  if (!endpoint) {
    return;
  }

  const body = JSON.stringify({
    event_name: metaEventName,
    event_id: payload.event_id,
    event_time: payload.event_time,
    event_source_url: payload.page_url,
    action_source: "website",
    attribution: pick(payload, ATTRIBUTION_KEYS),
    custom_data: payload,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => {
    // Tracking should never block the landing page.
  });
}

function pick(source, keys) {
  return keys.reduce((picked, key) => {
    if (source[key]) {
      picked[key] = source[key];
    }
    return picked;
  }, {});
}

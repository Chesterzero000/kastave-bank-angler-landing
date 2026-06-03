import test from "node:test";
import assert from "node:assert/strict";
import { buildEventPayload, getMetaEventName, parseAttribution } from "./analyticsCore.js";

test("parseAttribution captures UTM, click ids, and infers creative metadata", () => {
  const attribution = parseAttribution(
    "?utm_source=meta&utm_medium=paid_social&utm_campaign=us_bank_angler_pretest_2026q2&utm_content=scan_before_cast_4x5_v1&utm_term=southeast_bass_interest&fbclid=abc",
  );

  assert.equal(attribution.utm_source, "meta");
  assert.equal(attribution.fbclid, "abc");
  assert.equal(attribution.creative_hook, "scan_before_cast");
  assert.equal(attribution.creative_format, "4x5");
  assert.equal(attribution.creative_version, "v1");
  assert.equal(attribution.audience_name, undefined);
});

test("parseAttribution preserves explicit creative fields over inferred values", () => {
  const attribution = parseAttribution(
    "?utm_content=scan_before_cast_4x5_v1&creative_hook=ai_fishing_plan&creative_id=05_ai_fishing_plan_4x5_v2",
  );

  assert.equal(attribution.creative_hook, "ai_fishing_plan");
  assert.equal(attribution.creative_id, "05_ai_fishing_plan_4x5_v2");
  assert.equal(attribution.creative_format, "4x5");
});

test("buildEventPayload includes attribution and a stable supplied event id", () => {
  const payload = buildEventPayload(
    "lead",
    { source: "hero", event_id: "evt_123" },
    {
      attribution: { utm_source: "meta", creative_hook: "find_structure" },
      now: new Date("2026-05-16T00:00:00Z"),
      path: "/",
      url: "https://kastave.com/",
      title: "Kastave",
      deviceType: "desktop",
    },
  );

  assert.equal(payload.event_id, "evt_123");
  assert.equal(payload.utm_source, "meta");
  assert.equal(payload.creative_hook, "find_structure");
  assert.equal(payload.event_time, 1778889600);
  assert.equal(payload.device_type, "desktop");
});

test("getMetaEventName maps first-priority pretest events", () => {
  assert.equal(getMetaEventName("page_view"), "PageView");
  assert.equal(getMetaEventName("view_content"), "ViewContent");
  assert.equal(getMetaEventName("lead"), "Lead");
  assert.equal(getMetaEventName("initiate_checkout"), "InitiateCheckout");
  assert.equal(getMetaEventName("purchase"), "Purchase");
  assert.equal(getMetaEventName("faq_opened"), null);
});

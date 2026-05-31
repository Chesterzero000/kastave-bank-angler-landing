import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const content = readFileSync(new URL("./content.js", import.meta.url), "utf8");
const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const tracking = readFileSync(new URL("./tracking.js", import.meta.url), "utf8");
const supabaseBackend = readFileSync(new URL("./supabaseBackend.js", import.meta.url), "utf8");
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const mediaScripts = readFileSync(new URL("../docs/kastave-v2-media-scripts.md", import.meta.url), "utf8");
const trackingMigration = readFileSync(
  new URL("../supabase/migrations/202605160002_pretest_tracking_summary.sql", import.meta.url),
  "utf8",
);

test("landing page presents the $1 to $100 credit offer and $600-$1,000 product price range", () => {
  assert.match(content, /productPrice:\s*"\$600-\$1,000"/);
  assert.match(content, /creditAmount:\s*"\$100"/);
  assert.match(content, /depositAmount:\s*"\$1"/);
  assert.match(app, /hero-offer-card/);
  assert.match(content, /not a finished-unit purchase/);
  assert.match(app, /reservation-clarity/);
});

test("landing page supports the three paid-ad hook variants", () => {
  assert.match(content, /HOOK_VARIANTS/);
  assert.match(content, /The obvious cast is not always the right cast/);
  assert.match(content, /Stop casting your fish finder/);
  assert.match(content, /Safe Cast\. Structure Cast\. Risk \/ Reward Cast/);
  assert.match(app, /getLandingHookVariant/);
  assert.match(app, /landing_hook_variant_view/);
  assert.match(styles, /hero-hook-card/);
});

test("app mode section highlights auto mode and keeps other modes as text", () => {
  assert.match(app, /const \[autoMode, \.\.\.supportModes\] = APP_MODES/);
  assert.match(app, /Auto mode first\. Quiet or fast when you need it\./);
  assert.match(app, /className="app-mode-card app-mode-card-auto"/);
  assert.match(app, /className="app-mode-text-grid"/);
  assert.match(app, /className="auto-mode-media" aria-label="Auto Mode media slot"/);
  assert.match(app, /className="auto-mode-placeholder" aria-hidden="true"/);
  assert.doesNotMatch(app, /activeModeKey/);
  assert.doesNotMatch(app, /role="tab"/);
  assert.doesNotMatch(app, /phone-shell/);
});

test("hero uses simple launch language and Kickstarter status", () => {
  assert.match(content, /Coming soon on Kickstarter/);
  assert.match(content, /Your shoreline fishing scout/);
  assert.match(app, /hero-launch-row/);
  assert.match(app, /Kickstarter/);
  assert.match(app, /buttonLabel="Sign up"/);
});

test("hero signup continues to the deposit page before payment", () => {
  assert.match(app, /const continueToDeposit = source === "hero"/);
  assert.match(app, /localStorage\.setItem\("kastave_last_signup_email", email\)/);
  assert.match(app, /trackEvent\("signup_continue_to_deposit"/);
  assert.match(app, /window\.location\.href = withUtm\("\/deposit"\)/);
});

test("v2 landing page adds a founder offer bar, app UI modes, specs, and media direction", () => {
  assert.match(app, /function LaunchOfferBar/);
  assert.match(app, /<LaunchOfferBar/);
  assert.match(app, /V2_PROOF_POINTS/);
  assert.match(app, /function AppExperienceSection/);
  assert.match(app, /APP_MODES/);
  assert.match(app, /Auto Mode/);
  assert.match(app, /Silent Mode/);
  assert.match(app, /Performance Mode/);
  assert.match(app, /Auto shoreline sweep/);
  assert.match(app, /Quiet close-cover pass/);
  assert.match(app, /Fast long-bank sweep/);
  assert.match(app, /auto-mode-panel/);
  assert.match(app, /auto-cast-row/);
  assert.match(app, /function ProductSpecsSection/);
  assert.match(app, /PRODUCT_SPECS/);
  assert.match(app, /function SpecIcon/);
  assert.match(app, /Built tough\. Bank ready\./);
  assert.match(app, /6 hours/);
  assert.match(app, /5 kg/);
  assert.match(app, /20 m radius/);
  assert.match(app, /1\.5 m\/s max/);
  assert.match(app, /Beaufort 3/);
  assert.match(app, /Wi-Fi 6/);
  assert.match(app, /Bluetooth 5\.4/);
  assert.match(app, /function MediaScriptSection/);
  assert.match(app, /MEDIA_SCRIPT_CARDS/);
  assert.match(app, /kastave-audience-castable-auto-scan-ui-v7\.jpg/);
  assert.match(styles, /\.launch-offer-bar/);
  assert.match(styles, /\.app-ui-section/);
  assert.match(styles, /\.auto-mode-placeholder/);
  assert.match(styles, /\.app-mode-text-grid/);
  assert.match(styles, /\.auto-mode-panel/);
  assert.doesNotMatch(styles, /\.phone-shell/);
  assert.match(styles, /\.product-specs-section/);
  assert.match(styles, /\.specs-showcase/);
  assert.match(styles, /\.specs-product-image/);
  assert.match(styles, /\.specs-detail-row/);
  assert.match(styles, /\.spec-icon/);
  assert.match(styles, /\.media-script-section/);
});

test("media scripts include four persona-specific image directions", () => {
  assert.match(mediaScripts, /Target Audience Card Assets/);
  assert.match(mediaScripts, /The Bank-Only Bass Angler/);
  assert.match(mediaScripts, /The After-Work Pond Hopper/);
  assert.match(mediaScripts, /The Snag-Weary Lure Saver/);
  assert.match(mediaScripts, /The Castable-Sonar Upgrade Seeker/);
  assert.match(mediaScripts, /Person:/);
  assert.match(mediaScripts, /Scene:/);
  assert.match(mediaScripts, /Composition:/);
  assert.match(mediaScripts, /Overlay direction:/);
});

test("landing page promotes the AI cast choices through the highlights bento", () => {
  assert.doesNotMatch(content, /CAST_OPTIONS/);
  assert.match(content, /Safe Cast\. Structure Cast\. Risk \/ Reward Cast/);
  assert.match(app, /AI CAST CALLS/);
  assert.match(app, /safe, structure, swing-for-it/);
  assert.match(app, /CastOptionsSection/);
  assert.match(styles, /cast-options-section/);
  assert.doesNotMatch(styles, /cast-options-layout/);
});

test("highlights section follows the rounded bento reference geometry", () => {
  assert.match(app, /Get the Highlights/);
  assert.match(app, /3D UNDERWATER VIEW/);
  assert.match(app, /AUTO-SCAN THE BANK/);
  assert.match(app, /SENSE THE WATER/);
  assert.match(app, /AI CAST CALLS/);
  assert.match(app, /KEEP YOUR HONEY HOLES/);
  assert.match(app, /highlight-bento-card-wide/);
  assert.match(styles, /\.highlight-bento-card\s*\{[^}]*border-radius:\s*60px/s);
  assert.match(styles, /\.highlight-bento-grid\s*\{[^}]*gap:\s*12px/s);
  assert.match(styles, /aspect-ratio:\s*1068\s*\/\s*507/);
  assert.match(styles, /border-radius:\s*32px/);
});

test("landing page includes a Mondo-style target audience carousel", () => {
  assert.match(app, /TARGET_AUDIENCES/);
  assert.match(app, /Who is Kastave For/);
  assert.match(app, /The Bank-Only Bass Angler/);
  assert.match(app, /The After-Work Pond Hopper/);
  assert.match(app, /The Snag-Weary Lure Saver/);
  assert.match(app, /The Castable-Sonar Upgrade Seeker/);
  assert.match(app, /kastave-audience-bank-angler\.jpg/);
  assert.match(app, /kastave-audience-pond-hopper\.jpg/);
  assert.match(app, /kastave-audience-hidden-snag-first-person-v4\.jpg/);
  assert.match(app, /kastave-audience-castable-auto-scan-ui-v7\.jpg/);
  assert.match(app, /Forty minutes after work/);
  assert.match(app, /casting your fish finder feels like work/);
  assert.match(app, /animation:\s*"bank"/);
  assert.match(app, /animation:\s*"timer"/);
  assert.match(app, /animation:\s*"snag"/);
  assert.match(app, /animation:\s*"sonar"/);
  assert.match(app, /function AudienceSection/);
  assert.match(app, /function AudienceVisual/);
  assert.match(app, /audience_carousel_scroll/);
  assert.match(app, /audience-media/);
  assert.match(app, /<AudienceSection \/>/);
  assert.match(styles, /\.audience-card-row\s*\{[^}]*grid-auto-flow:\s*column/s);
  assert.match(styles, /\.audience-media\s*\{[^}]*aspect-ratio:\s*1\.22/s);
  assert.match(styles, /\.audience-visual-layer\s*\{[^}]*pointer-events:\s*none/s);
  assert.match(styles, /\.audience-card img\s*\{[^}]*border-radius:\s*32px/s);
  assert.match(app, /audience-cast-arc/);
  assert.match(app, /audience-bank-reach-edge/);
  assert.match(app, /audience-time-window/);
  assert.match(app, /audience-calm-surface/);
  assert.match(app, /audience-snag-root/);
  assert.match(app, /audience-snag-tension-line/);
  assert.match(app, /audience-hook-point/);
  assert.match(app, /audience-repeat-cast-arc/);
  assert.match(app, /audience-kastave-scan-beam/);
  assert.match(app, /audience-snag-lock/);
  assert.match(app, /audience-forward-wake/);
  assert.match(styles, /\.audience-media-bank \.audience-bank-reach-edge/);
  assert.match(styles, /\.audience-media-bank \.audience-scan-fan/);
  assert.match(styles, /\.audience-media-bank \.audience-cast-arc/);
  assert.match(styles, /\.audience-media-timer \.audience-time-window/);
  assert.match(styles, /\.audience-media-timer \.audience-clock-ring/);
  assert.match(styles, /\.audience-media-snag \.audience-calm-surface/);
  assert.match(styles, /\.audience-media-snag \.audience-snag-root/);
  assert.match(styles, /\.audience-media-snag \.audience-hook-point/);
  assert.match(styles, /\.audience-media-snag \.audience-warning-one/);
  assert.match(styles, /\.audience-media-snag \.audience-snag-lock/);
  assert.match(styles, /\.audience-media-sonar \.audience-repeat-cast-arc/);
  assert.match(styles, /\.audience-media-sonar \.audience-kastave-scan-beam/);
  assert.match(styles, /\.audience-media-sonar \.audience-scout-route/);
  assert.match(styles, /\.audience-media-sonar \.audience-forward-wake/);
  assert.match(styles, /@keyframes audienceCastArc/);
  assert.match(styles, /@keyframes audienceReachEdge/);
  assert.match(styles, /@keyframes audienceTimeWindow/);
  assert.match(styles, /@keyframes audienceScanSweep/);
  assert.match(styles, /@keyframes audienceSurfaceCalm/);
  assert.match(styles, /@keyframes audienceLineTension/);
  assert.match(styles, /@keyframes audienceHookJerk/);
  assert.match(styles, /@keyframes audienceRepeatCast/);
  assert.match(styles, /@keyframes audienceWakeForward/);
  assert.match(styles, /@keyframes audienceSonarBall/);
  assert.match(styles, /\.audience-controls button\s*\{[^}]*border-radius:\s*50%/s);
});

test("landing page does not render the removed castable workflow comparison", () => {
  assert.doesNotMatch(content, /CASTABLE_WORKFLOW/);
  assert.doesNotMatch(app, /<CastableComparisonSection \/>/);
  assert.doesNotMatch(app, /function CastableComparisonSection/);
  assert.doesNotMatch(app, /function WorkflowCard/);
  assert.doesNotMatch(app, /castable-comparison/);
  assert.doesNotMatch(app, /Workflow comparison/);
  assert.doesNotMatch(styles, /\.castable-comparison-section/);
  assert.doesNotMatch(styles, /\.castable-heading/);
  assert.doesNotMatch(styles, /\.workflow-grid/);
  assert.doesNotMatch(styles, /\.workflow-card/);
});

test("landing page does not render the removed how it works section", () => {
  assert.doesNotMatch(content, /PROCESS_STEPS/);
  assert.doesNotMatch(app, /<HowItWorksSection \/>/);
  assert.doesNotMatch(app, /function HowItWorksSection/);
  assert.doesNotMatch(app, /how-it-works/);
  assert.doesNotMatch(app, /How it works/);
  assert.doesNotMatch(app, /From unknown bank water to a first-cast plan/);
  assert.doesNotMatch(app, /Deploy \/ Scan \/ 3D Read \/ Choose Cast/);
  assert.doesNotMatch(styles, /\.how-section/);
  assert.doesNotMatch(styles, /\.how-layout/);
  assert.doesNotMatch(styles, /\.how-media/);
  assert.doesNotMatch(styles, /\.how-step/);
});

test("landing page does not render the removed core capabilities carousel", () => {
  assert.doesNotMatch(app, /<FeaturesSection \/>/);
  assert.doesNotMatch(app, /function FeaturesSection/);
  assert.doesNotMatch(app, /Core capabilities/);
  assert.doesNotMatch(app, /features-title/);
  assert.doesNotMatch(app, /#features/);
  assert.doesNotMatch(content, /FEATURE_VISUALS/);
  assert.doesNotMatch(content, /FEATURE_GROUPS/);
  assert.doesNotMatch(styles, /\.feature-carousel/);
  assert.doesNotMatch(styles, /\.highlight-carousel/);
  assert.doesNotMatch(styles, /\.capability-card/);
  assert.doesNotMatch(styles, /\.scenario-section/);
  assert.doesNotMatch(styles, /\.product-card-grid/);
  assert.doesNotMatch(styles, /\.accessory-grid/);
  assert.doesNotMatch(styles, /\.trust-bar/);
});

test("landing page does not render the removed product value plan section", () => {
  assert.doesNotMatch(app, /<ValueSection \/>/);
  assert.doesNotMatch(app, /function ValueSection/);
  assert.doesNotMatch(app, /Product value/);
  assert.doesNotMatch(app, /#plan/);
});

test("landing page does not render the removed bank angler problem section", () => {
  assert.doesNotMatch(app, /<PainSection \/>/);
  assert.doesNotMatch(app, /function PainSection/);
  assert.doesNotMatch(app, /function PainEvidenceDialog/);
  assert.doesNotMatch(app, /function PainPointCta/);
  assert.doesNotMatch(app, /Bank angler problem/);
  assert.doesNotMatch(app, /Stop guessing where to start/);
  assert.doesNotMatch(app, /Reddit proof/);
  assert.doesNotMatch(app, /#pain/);
  assert.doesNotMatch(app, /pain_point_cta/);
  assert.doesNotMatch(content, /BANK_PAIN_POINTS/);
  assert.doesNotMatch(content, /LANDING_PAIN_POINTS/);
  assert.doesNotMatch(styles, /\.pain-section/);
  assert.doesNotMatch(styles, /\.pain-card-grid/);
  assert.doesNotMatch(styles, /\.pain-cta-card/);
  assert.doesNotMatch(styles, /\.pain-proof-dialog/);
});

test("landing page imports every image referenced by highlight cards", () => {
  assert.match(app, /import processImage from "\.\.\/assets\/kastave-new-process\.jpg"/);
  assert.match(app, /image:\s*processImage/);
});

test("landing page exposes Stripe and PayPal checkout options", () => {
  assert.match(
    content,
    /const STRIPE_PAYMENT_LINK =\s*import\.meta\.env\.VITE_STRIPE_PAYMENT_LINK\s*\|\|\s*"https:\/\/buy\.stripe\.com\/9B69AVbpieTIcPx9rBd7q00"/,
  );
  assert.match(
    content,
    /const PAYPAL_PAYMENT_LINK =\s*import\.meta\.env\.VITE_PAYPAL_PAYMENT_LINK\s*\|\|\s*"https:\/\/www\.paypal\.com\/ncp\/payment\/6W9PTBNB267ZW"/,
  );
  assert.match(content, /PAYMENT_METHODS/);
  assert.match(content, /paypalPaymentLink:\s*PAYPAL_PAYMENT_LINK/);
  assert.match(content, /reservationPaymentLink:\s*DEFAULT_PAYMENT_METHOD\.paymentLink/);
  assert.match(app, /PAYMENT_METHODS\.map/);
  assert.match(app, /reservation-deposit-button/);
  assert.match(app, /Choose Stripe or PayPal on the deposit page/);
  assert.doesNotMatch(app, /Pay with \{method\.label\}/);
  assert.match(app, /window\.location\.href = withUtm\(paymentLink\)/);
});

test("top reservation CTA opens the deposit checkout page", () => {
  assert.match(app, /const currentPath = window\.location\.pathname/);
  assert.match(app, /const isDepositPage = currentPath === "\/deposit"/);
  assert.match(app, /const openDepositPage = \(source = "unknown", event\) => \{/);
  assert.match(app, /href=\{depositHref\}/);
  assert.match(app, /if \(event\?\.currentTarget\?\.tagName === "A"\)/);
  assert.match(app, /window\.location\.href = withUtm\("\/deposit"\)/);
  assert.match(app, /<DepositPage onPayment=\{\(providerKey\) => reserveWithPayment\(providerKey, "deposit_page"\)\}/);
  assert.match(app, /onReserve=\{\(event\) => openDepositPage\("hero", event\)\}/);
  assert.match(app, /window\.location\.href = withUtm\(paymentLink\)/);
});

test("homepage reserve tracking is handled by React instead of the legacy HTML interceptor", () => {
  assert.doesNotMatch(index, /stopImmediatePropagation/);
  assert.doesNotMatch(index, /trackReserveClick/);
  assert.doesNotMatch(index, /buildDepositUrl/);
  assert.match(app, /trackLeadIntent\(\{ cta: "reserve_for_1"/);
  assert.match(app, /trackEvent\("deposit_page_open"/);
});

test("Meta Pixel remains installed with the configured pixel id", () => {
  assert.match(tracking, /DEFAULT_META_PIXEL_ID\s*=\s*"1542765323857764"/);
  assert.match(tracking, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(tracking, /window\.fbq\("init", metaPixelId\)/);
  assert.match(index, /facebook\.com\/tr\?id=1542765323857764&ev=PageView&noscript=1/);
});

test("site includes production-ready SEO and social metadata", () => {
  assert.match(index, /<title>Kastave \| Scan Before You Cast<\/title>/);
  assert.match(index, /<link rel="canonical" href="https:\/\/kastave\.com\/" \/>/);
  assert.match(index, /<meta[\s\S]*?name="description"[\s\S]*?content="Kastave is a shoreline fishing scout/);
  assert.match(index, /<meta name="theme-color" content="#d95b00" \/>/);
  assert.match(index, /<meta property="og:title" content="Kastave \| Scan Before You Cast" \/>/);
  assert.match(index, /<meta property="og:image" content="https:\/\/kastave\.com\/kastave-hero\.jpg" \/>/);
  assert.match(index, /<meta property="og:image:alt"/);
  assert.match(index, /<meta name="twitter:card" content="summary_large_image" \/>/);
  assert.match(index, /<meta name="twitter:title" content="Kastave \| Scan Before You Cast" \/>/);
  assert.match(index, /<meta[\s\S]*?name="twitter:description"[\s\S]*?content="A shoreline fishing scout/);
  assert.match(index, /<meta name="twitter:image" content="https:\/\/kastave\.com\/kastave-hero\.jpg" \/>/);
});

test("image loading priorities favor fast landing-page rendering", () => {
  assert.match(app, /className="hero-image"[\s\S]*?fetchPriority="high"[\s\S]*?decoding="async"/);
  assert.match(app, /className="deposit-hero-image"[\s\S]*?fetchPriority="high"[\s\S]*?decoding="async"/);
  assert.match(app, /<img src=\{item\.image\} alt="" aria-hidden="true" loading="lazy" decoding="async" \/>/);
  assert.match(app, /src=\{audience\.image\}[\s\S]*?loading="lazy"[\s\S]*?decoding="async"/);
  assert.match(app, /src=\{productDetailImage\}[\s\S]*?alt="Kastave scout boat product detail"[\s\S]*?loading="lazy"[\s\S]*?decoding="async"/);
});

test("deposit page presents a polished reservation checkout", () => {
  assert.match(app, /function DepositPage/);
  assert.match(app, /deposit-floating-nav/);
  assert.match(app, /deposit-mondo-hero/);
  assert.match(app, /deposit-mondo-card-grid/);
  assert.match(app, /deposit-mondo-save/);
  assert.match(app, /deposit-mondo-how/);
  assert.match(app, /deposit-mondo-faq/);
  assert.match(app, /jumpToDepositCheckout/);
  assert.match(app, /deposit_checkout_jump/);
  assert.match(app, /onClick=\{\(\) => onPayment\(method\.key\)\}/);
  assert.match(app, /Deposit Now <span aria-hidden="true">-&gt;<\/span>/);
  assert.match(app, /Deposit Now,/);
  assert.match(app, /Credit Later/);
  assert.match(app, /Estimated product price/);
  assert.match(app, /not the full product/);
  assert.match(content, /depositAmount:\s*"\$1"/);
  assert.match(content, /creditAmount:\s*"\$100"/);
  assert.match(app, /Credit Card/);
  assert.match(app, /PayPal/);
  assert.match(app, /function DepositPerkIcon/);
  assert.match(app, /icon: "pricing"/);
  assert.match(app, /icon: "allocation"/);
  assert.match(app, /icon: "updates"/);
  assert.match(app, /Founder pricing/);
  assert.match(app, /How does the deposit work\?/);
  assert.match(app, /FAQ/);
  assert.match(app, /No long checkout form on this page\./);
  assert.match(styles, /\.deposit-floating-nav\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(styles, /\.deposit-mondo-hero\s*\{[^}]*border-radius:\s*0\s*0\s*48px\s*48px/s);
  assert.match(styles, /\.deposit-mondo-card-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /\.deposit-mondo-card\s*\{[^}]*border-radius:\s*30px/s);
  assert.match(styles, /\.deposit-card-icon svg\s*\{[^}]*stroke:\s*currentColor/s);
  assert.match(styles, /\.deposit-mondo-primary\s*\{[^}]*min-width:\s*min\(310px,\s*100%\)/s);
  assert.match(styles, /\.deposit-mondo-save\s*\{[^}]*scroll-margin-top:\s*110px/s);
  assert.match(styles, /\.deposit-mondo-payment-row\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /\.deposit-mondo-steps\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /\.deposit-mondo-faq-box\s*\{[^}]*border-radius:\s*48px/s);
});

test("old deposit page implementation styles are removed", () => {
  assert.doesNotMatch(styles, /\.deposit-shell/);
  assert.doesNotMatch(styles, /\.deposit-hero-stage/);
  assert.doesNotMatch(styles, /\.deposit-checkout-section/);
  assert.doesNotMatch(styles, /\.deposit-hero-payment-options/);
  assert.doesNotMatch(styles, /\.deposit-perk-grid/);
  assert.doesNotMatch(styles, /\.deposit-faq-grid/);
});

test("site includes privacy policy and terms pages", () => {
  assert.match(app, /const isPrivacyPage = currentPath === "\/privacy" \|\| currentPath === "\/policies\/privacy-policy"/);
  assert.match(app, /const isTermsPage = currentPath === "\/terms" \|\| currentPath === "\/policies\/terms-of-service"/);
  assert.match(app, /function LegalPage/);
  assert.match(app, /PRIVACY_POLICY_SECTIONS/);
  assert.match(app, /TERMS_SECTIONS/);
  assert.match(app, /Privacy Policy/);
  assert.match(app, /Terms of Service/);
  assert.match(app, /Meta Pixel/);
  assert.match(app, /Stripe and PayPal/);
  assert.match(app, /founder reservation is not a finished-product purchase/);
  assert.match(app, /DepositPolicyFooter/);
  assert.match(styles, /\.legal-page/);
  assert.match(styles, /\.legal-card/);
  assert.match(styles, /\.deposit-policy-footer/);
});

test("privacy section shows an app-style private waypoint map visual", () => {
  assert.match(app, /function PrivacyAppVisual/);
  assert.match(app, /Kastave app screen saving a private fishing waypoint/);
  assert.match(app, /Waypoint saved/);
  assert.match(app, /North grass edge/);
  assert.match(app, /Private waypoint log/);
  assert.match(app, /<PrivacyAppVisual \/>/);
  assert.match(styles, /\.privacy-app-visual\s*\{/);
  assert.match(styles, /\.privacy-map-screen\s*\{/);
  assert.match(styles, /\.privacy-waypoint-primary/);
  assert.match(styles, /\.privacy-save-card/);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.privacy-map-screen\s*\{[^}]*min-height:\s*246px/s);
});

test("landing page explains the dual payment provider path", () => {
  assert.match(content, /PAYMENT_NOTE/);
  assert.match(content, /Choose Stripe or PayPal/);
  assert.match(content, /What if Stripe or PayPal does not redirect after payment\?/);
  assert.match(app, /payment-after-note/);
  assert.match(app, /What happens after payment\?/);
  assert.match(app, /thanks-next-steps/);
  assert.match(app, /source="thanks"/);
});

test("verified purchase records are webhook-only", () => {
  assert.doesNotMatch(app, /recordPurchaseEvent/);
  assert.doesNotMatch(supabaseBackend, /export function recordPurchaseEvent/);
  assert.match(trackingMigration, /from public\.purchase_events/);
  assert.match(trackingMigration, /verified_purchases/);
  assert.match(trackingMigration, /thank_you_purchase_events/);
});

test("navigation and footer only point to live landing sections", () => {
  assert.match(app, /href="\/"\s+aria-label="Kastave home"/);
  assert.match(app, /aria-label=\{open \? "Close menu" : "Open menu"\}/);
  assert.match(app, /aria-expanded=\{open\}/);
  assert.match(app, /aria-controls="primary-navigation"/);
  assert.match(app, /id="primary-navigation"/);
  assert.match(app, /Highlights: "#cast-options"/);
  assert.match(app, /"Who it's for": "#audience"/);
  assert.match(app, /App: "#app-ui"/);
  assert.match(app, /Specs: "#specs"/);
  assert.match(app, /trackFooterLink\("audience", "#audience"\)/);
  assert.match(app, /trackFooterLink\("app_ui", "#app-ui"\)/);
  assert.match(app, /trackFooterLink\("specs", "#specs"\)/);
  assert.doesNotMatch(app, /trackFooterLink\("proof", "#pain"\)/);
  assert.doesNotMatch(app, /trackFooterLink\("comparison", "#castable-comparison"\)/);
  assert.doesNotMatch(app, /Casts: "#cast-options"/);
  assert.doesNotMatch(app, /Features: "#features"/);
});

test("audience and highlight headings use the same display scale", () => {
  assert.match(styles, /\.highlight-bento-heading\s*\{[^}]*font-size:\s*48px/s);
  assert.match(styles, /\.audience-heading\s*\{[^}]*font-size:\s*48px/s);
  assert.match(styles, /\.audience-heading\s*\{[^}]*font-weight:\s*700/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.highlight-bento-heading\s*\{[^}]*font-size:\s*clamp\(2rem,\s*10vw,\s*3rem\)/);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.audience-heading\s*\{[^}]*font-size:\s*clamp\(2rem,\s*10vw,\s*3rem\)/);
});

test("mobile breakpoints keep landing and deposit flows usable", () => {
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.hero\s*\{[^}]*min-height:\s*auto/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.main-nav\s*\{[^}]*display:\s*none/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.main-nav\.is-open\s*\{[^}]*display:\s*flex/s);
  assert.match(styles, /\.launch-offer-inner > \*\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.launch-offer-copy strong\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.launch-proof-row,[\s\S]*?\.launch-offer-actions\s*\{[^}]*display:\s*grid/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.highlight-bento-grid,[\s\S]*?\.highlight-bento-main,[\s\S]*?\.highlight-bento-side\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.audience-card-row\s*\{[^}]*grid-auto-columns:\s*minmax\(286px,\s*82vw\)/s);
  assert.match(styles, /@media \(max-width:\s*820px\)[\s\S]*?\.deposit-mondo-card-grid,[\s\S]*?\.deposit-mondo-payment-row,[\s\S]*?\.deposit-mondo-steps\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.hero-actions,[\s\S]*?\.primary-button,[\s\S]*?\.secondary-link\s*\{[^}]*width:\s*100%/s);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.email-form\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.hero-actions \.email-form\s*\{[^}]*overflow:\s*visible/s);
  assert.match(styles, /@media \(max-width:\s*620px\)[\s\S]*?\.nav-waitlist-button\s*\{[^}]*display:\s*none/s);
});

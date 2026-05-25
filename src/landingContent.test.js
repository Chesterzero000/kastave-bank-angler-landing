import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const content = readFileSync(new URL("./content.js", import.meta.url), "utf8");
const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

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

test("landing page promotes the three branded cast choices", () => {
  assert.match(content, /CAST_OPTIONS/);
  assert.match(content, /Safe Cast/);
  assert.match(content, /Structure Cast/);
  assert.match(content, /Risk \/ Reward Cast/);
  assert.match(app, /CastOptionsSection/);
  assert.match(styles, /cast-options-section/);
});

test("landing page includes a castable sonar workflow comparison", () => {
  assert.match(content, /CASTABLE_WORKFLOW/);
  assert.match(content, /Castable sonar workflow/);
  assert.match(content, /Kastave workflow/);
  assert.match(app, /CastableComparisonSection/);
  assert.match(styles, /workflow-grid/);
});

test("landing page defines one product feature image for each core capability", () => {
  assert.match(content, /FEATURE_VISUALS/);
  assert.match(content, /"Auto Scan"/);
  assert.match(content, /"3D Terrain"/);
  assert.match(content, /"Water Conditions"/);
  assert.match(content, /"AI Cast Choices"/);
  assert.match(app, /feature-carousel/);
  assert.match(app, /feature-carousel-stage/);
  assert.match(app, /setActiveFeatureIndex/);
});

test("landing page does not render the removed product value plan section", () => {
  assert.doesNotMatch(app, /<ValueSection \/>/);
  assert.doesNotMatch(app, /function ValueSection/);
  assert.doesNotMatch(app, /Product value/);
  assert.doesNotMatch(app, /#plan/);
});

test("landing page imports every image referenced by carousel image mapping", () => {
  assert.match(app, /import processImage from "\.\.\/assets\/kastave-new-process\.png"/);
  assert.match(app, /process:\s*processImage/);
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
  assert.match(app, /Pay with \{method\.label\}/);
  assert.match(app, /window\.location\.href = withUtm\(paymentLink\)/);
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

test("feature carousel images fit one stable frame without cropping", () => {
  assert.match(styles, /\.feature-carousel-media\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(styles, /\.feature-carousel-media img\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(styles, /\.feature-carousel-stage:hover img\s*\{[^}]*scale/s);
});

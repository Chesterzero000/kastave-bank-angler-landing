import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const content = readFileSync(new URL("./content.js", import.meta.url), "utf8");
const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

test("landing page presents the $1 to $100 credit offer and $899 product price", () => {
  assert.match(content, /productPrice:\s*"\$899"/);
  assert.match(content, /creditAmount:\s*"\$100"/);
  assert.match(content, /depositAmount:\s*"\$1"/);
  assert.match(app, /hero-offer-card/);
});

test("landing page defines one product feature image for each core capability", () => {
  assert.match(content, /FEATURE_VISUALS/);
  assert.match(content, /"3D Terrain"/);
  assert.match(content, /"Fish Activity"/);
  assert.match(content, /"Water Conditions"/);
  assert.match(content, /"AI Strategy"/);
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

test("landing page has a working default PayPal checkout link", () => {
  assert.match(
    content,
    /paypalPaymentLink:\s*import\.meta\.env\.VITE_PAYPAL_PAYMENT_LINK\s*\|\|\s*"https:\/\/www\.paypal\.com\/ncp\/payment\/6W9PTBNB267ZW"/,
  );
  assert.match(app, /window\.location\.href = withUtm\(SITE\.paypalPaymentLink\)/);
});

test("landing page explains the post-PayPal payment path", () => {
  assert.match(content, /PAYPAL_PAYMENT_NOTE/);
  assert.match(content, /After PayPal payment/);
  assert.match(content, /What if PayPal does not redirect after payment\?/);
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

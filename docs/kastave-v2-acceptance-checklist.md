# Kastave V2 Acceptance Checklist

Last local verification: 2026-05-31 local worktree, before production deployment.

## Required Outcome

The V2 site should make a first-time visitor understand Kastave quickly, leave an email, and reach a simple `$1` founder reservation path with Stripe card or PayPal.

## Current Local Evidence

- Homepage hero uses simple Beni-style language: `meet Kastave`, `Your shoreline fishing scout`, `Coming soon · Kickstarter`.
- Hero email signup stores the email path and routes to `/deposit`.
- Homepage `Reserve for $1` CTAs route to `/deposit`, not directly to PayPal or Stripe.
- Homepage bottom founder-access card also routes to `/deposit`; direct payment choices only appear on `/deposit`.
- `/deposit` explains `$1 Deposit Now, $100 Credit Later`, founder reservation, expected product price, and the fact that it is not the full product purchase.
- `/deposit` exposes two payment choices: `Credit Card` through Stripe and `PayPal`.
- The payment page does not render a long card or billing form inside the Kastave site.
- Meta Pixel remains installed with pixel ID `1542765323857764`.
- The site does not manually send email, phone, name, or address fields to Meta advanced matching.
- Privacy Policy and Terms of Service routes exist at `/privacy`, `/terms`, `/policies/privacy-policy`, and `/policies/terms-of-service`.
- The old Core Capabilities carousel and old `#features` links are removed.
- The GitHub upload skill is stored in the project directory at `skills/github-upload/`.
- Browser route audit passed for `/`, `/deposit`, `/thanks?provider=stripe`, `/privacy`, `/terms`,
  `/policies/privacy-policy`, and `/policies/terms-of-service`: no missing images, Meta Pixel noscript present, and
  old Core Capabilities copy absent.
- Desktop and tablet-width browser audits show no page-level horizontal overflow. Mobile-specific CSS is now covered by
  tests for navigation collapse, single-column highlight/deposit layouts, full-width hero CTAs, and stacked email forms.
- Secret scan found no committed live keys. Matches are documentation placeholders and test-only fake webhook secrets.
- Current Codex shell has `node` but no `npm` / `npx`; bundled Node commands are documented for local verification.
- `scripts/preflight.mjs` now runs the repeatable local gate: tests, project structure check, asset reference check,
  deploy target check, React render smoke test, Vite production build, SPA fallback verification, production preview
  route smoke test, and sensitive-string scan.
- `scripts/check-project-structure.mjs` verifies the repo keeps only the current V2 site deliverables and project-local
  skills, without historical progress/superpowers docs or old GitHub Pages folders.
- `scripts/check-deploy-target.mjs` verifies the project is still configured for Vercel, not GitHub Pages, and that
  webhook route files, SPA rewrite, package scripts, and `.env.example` deployment variables are present.
- `scripts/check-assets.mjs` verifies required V2 assets exist and retired PNG / GitHub Pages public assets are absent
  from source references and the current filesystem.
- `scripts/render-smoke.mjs` verifies React-rendered homepage/deposit/thanks/legal/unknown-route output, including that
  homepage CTAs route to `/deposit` before payment, `/deposit` renders only the two payment choices, internal anchors
  point to real rendered section ids, internal routes are supported, and external links are limited to approved payment
  providers or email.
- `scripts/check-production-env.mjs` now verifies the required Vercel production environment variables without printing
  secret values or triggering any payment/deployment action.
- `scripts/deploy-ready.mjs` runs the full local preflight first, then requires the production payment, webhook,
  Supabase, and Meta Pixel environment variables to be present before deployment.
- `scripts/check-payment-links.mjs` verifies public Stripe / PayPal payment links without submitting payment details and
  blocks common merchant setup error pages.
- Production env validation is covered by automated tests for missing variables, valid required sample values, invalid
  payment hosts, placeholders, and invalid PayPal mode.
- Production preview route audit passed from `dist` on `http://127.0.0.1:4173/`, including `/`, `/deposit`,
  `/thanks?provider=stripe`, legal routes, policy aliases, and an unknown route SPA fallback.
- Browser responsive layout audit passed on desktop `1440x960`, tablet `1024x900`, and mobile `390x844`: homepage and
  `/deposit` both report `overflowX: 0`; mobile nav switches to the hamburger; `Who is Kastave For` and `Get the
  Highlights` remain the same heading size at each breakpoint; `/deposit` still has only `Credit Card` and `PayPal`
  payment choices with no long checkout form.

## Requirement Audit

- Latest local version retained: old GitHub Pages workflow/CNAME and old heavy PNG hero/product assets are removed from the current worktree; current V2 assets are JPGs referenced by React.
- Old deposit-page CSS from earlier iterations is removed; current checkout styling is the `deposit-mondo-*` implementation only.
- Meta Pixel: `src/tracking.js`, `index.html`, `.env.example`, and tests all use `1542765323857764`.
- Payment simplification: all homepage reservation links point to `/deposit`; `/deposit` has only `Credit Card` and `PayPal` buttons, with no embedded billing form.
- Beni/Mondo-inspired structure: hero, launch offer, highlight bento, target audience carousel, deposit page, rounded cards, and simple CTA hierarchy are implemented locally.
- Target audiences: four personas are implemented with image assets and scene-specific overlay animations.
- App UI: Auto, Silent, and Performance mode previews are present in the phone mockup.
- Legal: privacy and terms pages are implemented under both short and Shopify-style policy paths.
- Verified payments: browser `/thanks` only sends attribution events; `purchase_events` is reserved for Stripe / PayPal webhook records.
- GitHub upload skill: project-local skill exists at `skills/github-upload/` with workflow and reference playbook.
- Deployment: intentionally not completed; production deploy requires user visual approval and Vercel/payment environment checks.

## Explicit User Request Matrix

| User request | Current status | Evidence |
| --- | --- | --- |
| Keep only the latest Kastave independent-site code | Done locally | `scripts/check-project-structure.mjs`, deleted old GitHub Pages workflow/CNAME, retired old PNG assets |
| Store the GitHub upload skill inside the project directory | Done locally | `skills/github-upload/`, `scripts/check-project-structure.mjs` allowed skill dirs |
| Install/keep Meta Pixel `1542765323857764` | Done locally | `src/tracking.js`, `index.html` noscript, `src/landingContent.test.js` |
| Do not rely on manual Meta advanced matching fields | Done locally | Site has no name, phone, address, DOB, or gender collection fields |
| Homepage should use simpler Beni/Mondo-style language | Done locally | Hero copy: `meet Kastave`, `Your shoreline fishing scout`, `Coming soon · Kickstarter` |
| Include `Coming soon · Kickstarter` positioning | Done locally | Homepage hero, founder offer bar, deposit hero, product specs |
| Homepage email signup should go to `/deposit` before payment | Done locally | React render smoke and `hero signup continues to the deposit page before payment` test |
| Homepage `Reserve for $1` should not jump directly to PayPal/Stripe | Done locally | `render-smoke` verifies homepage reservation links route to `/deposit` |
| `/deposit` should present a polished Beni/Mondo-style reservation page | Done locally | `deposit-mondo-*` implementation and `deposit page presents a polished reservation checkout` test |
| Deposit CTA should jump to payment choices | Done locally | `jumpToDepositCheckout`, `deposit_checkout_jump`, `#deposit-checkout` |
| Payment should be simple: choose Stripe credit card or PayPal | Done locally | `/deposit` renders `Credit Card` and `PayPal` buttons only |
| Avoid a long checkout/billing form on Kastave site | Done locally | `render-smoke` and tests verify no embedded long form fields |
| Clarify `$1 deposit` and `$100 credit later` so users do not mistake it for full product purchase | Done locally | Deposit copy includes target product price and not-full-product language |
| Add terms and privacy pages | Done locally | `/privacy`, `/terms`, `/policies/privacy-policy`, `/policies/terms-of-service` |
| Use 5 product highlights: 3D underwater, auto scan/cruise, water/fish sensing, AI 3 cast calls, private spot log | Done locally | Highlights bento copy and assets |
| Use American fishing-language framing | Done locally | `skills/american-bass-angler-copy/`, persona titles, final copy such as `Scan the water, see the bottom, and pick your first cast` |
| Target user section should have 4 personas | Done locally | `TARGET_AUDIENCES` and target audience carousel |
| `Who is Kastave For` should match `Get the Highlights` heading size/color | Done locally | Browser DOM audit: both headings `48px`, both `rgb(217, 91, 0)`; test covers same display scale |
| Target user image effects should match each scene | Done locally | `AudienceVisual` variants: bank, timer, snag, sonar |
| Remove the Core Capabilities section | Done locally | `render-smoke` excludes `Core Capabilities`; browser DOM audit confirms absent |
| Add app UI concept with Auto/Silent/Performance modes | Done locally | `APP_MODES` and app UI section |
| Add product specs/launch parameters | Done locally | Specs section and product copy |
| Add material scripts for future video/photo production | Done locally | `docs/kastave-v2-media-scripts.md` |
| Keep local preview running for user review | Done locally | Dev server on `http://127.0.0.1:5173/` |
| Deploy production version | Not done by design | Requires user visual approval and real Vercel production env values |
| Verify real Stripe/PayPal payment completion | Not done by design | Requires production payment platform dashboards/webhooks after deployment |

## Page Sections

- Hero: simple positioning, email signup, reserve CTA, Kickstarter status.
- Launch offer bar: founder reservation proof points and CTA.
- Highlights: 3D underwater view, auto-scan, water sensing, AI cast calls, private spot log.
- Target audience: 4 bank-angler personas with matched image overlays.
- App UI: Auto Mode hero with media slot, plus text summaries for Silent and Performance.
- Product specs: product-image hero plus battery, weight, sonar range, speed, wind/chop, and connectivity details.
- Media direction: scripts for the next proof assets.
- Privacy: private maps and spot ownership.
- Reservation: email plus a single `Reserve for $1` path into `/deposit`.
- FAQ and footer.

## Verification Commands

Use the bundled Node runtime if local `npm` is not available:

```bash
node scripts/preflight.mjs
```

Expected current result: preflight passes.

```bash
node scripts/check-project-structure.mjs
```

Expected current result: current V2 directories/docs/skills only; no historical progress or superpowers docs.

```bash
node scripts/check-assets.mjs
```

Expected current result: required V2 assets exist and retired asset references are absent.

```bash
node scripts/check-deploy-target.mjs
```

Expected current result: Vercel deploy target, webhook routes, SPA rewrite, package scripts, and env example are valid.

```bash
node scripts/render-smoke.mjs
```

Expected current result: React render smoke passes for homepage CTA flow, deposit payment choices, thanks, legal pages,
unknown-route fallback, internal anchors, internal routes, and approved external links.

```bash
node scripts/preview-smoke.mjs
```

Expected current result: production preview smoke passes for homepage, deposit, thanks, legal/policy aliases, and
unknown-route SPA fallback.

```bash
node scripts/check-production-env.mjs
```

Expected local result without real production env: fails clearly with the missing required variables. Expected Vercel
production result: passes after real Stripe, PayPal, Supabase, and Meta Pixel values are configured. For local production
verification, put real values in ignored `.env.production.local` or pass `--kastave-env-file .env.production.local`.

```bash
node scripts/deploy-ready.mjs
```

Expected production result: preflight passes first, then production env validation and payment-link smoke checks pass.
Expected local result without real production env: env validation and payment-link failures are both reported clearly, and
no deployment action is taken.

Manual commands:

```bash
node --test src/**/*.test.js api/**/*.test.js
```

Expected current result: all `src/`, `api/`, and `scripts/` tests pass.

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/create-spa-fallback.mjs
```

Expected current result: Vite production build succeeds and `dist/404.html` is generated.

Latest local result on 2026-05-31:

- `node --test src/**/*.test.js api/**/*.test.js scripts/**/*.test.js`: pass.
- Vite production build: pass.
- `git diff --check`: pass.
- Browser DOM route audit: pass for homepage, deposit, thanks, privacy, terms, and policy aliases.
- Sensitive string scan: no live Stripe, PayPal, Supabase, GitHub, AWS, or private-key material found in tracked source
  and docs outside placeholders/tests.
- `node scripts/check-project-structure.mjs`: pass.
- `node scripts/check-assets.mjs`: pass.
- `node scripts/check-deploy-target.mjs`: pass.
- `node scripts/render-smoke.mjs`: pass.
- `node scripts/preview-smoke.mjs`: pass.
- `node scripts/preflight.mjs`: pass, including production preview route smoke test.
- `node scripts/check-production-env.mjs` with empty local env: fails clearly with missing required production variables.
- `node scripts/check-production-env.mjs` with non-secret sample required env values: passes while warning about recommended
  analytics/newsletter variables.
- `node scripts/check-production-env.mjs --kastave-env-file .env.production.local`: supported for ignored local production values.
- `node scripts/deploy-ready.mjs`: local preflight passes, then the production gate reports both current blockers:
  missing production env values and the broken PayPal payment link. Use it as the final Vercel-ready gate after configuring
  production secrets and replacing the PayPal link.
- Browser responsive layout audit after the mobile founder-offer fix: `1440x960`, `1024x900`, and `390x844` all have
  homepage `overflowX: 0` and deposit-page `overflowX: 0`.
- `node scripts/check-payment-links.mjs`: Stripe link is reachable; current PayPal link returns a merchant/payment setup
  error page and must be repaired or replaced before production deployment.

## Deployment Gate

Do not deploy until:

1. Local visual review is approved.
2. Vercel production environment variables are configured and `node scripts/deploy-ready.mjs` passes.
3. Stripe Payment Link redirect is set to `https://kastave.com/thanks?provider=stripe`.
4. PayPal return URL is set to `https://kastave.com/thanks?provider=paypal` if PayPal supports it for this link.
5. Stripe and PayPal webhooks are configured in production.
6. `node scripts/check-payment-links.mjs` or
   `node scripts/check-payment-links.mjs --kastave-env-file .env.production.local`
   passes for both Stripe and PayPal.

## Known Non-Code Follow-Ups

- Final video/photo materials still depend on real or generated production-ready assets.
- Final product specs should be updated after field testing.
- Payment completion should be verified in Stripe and PayPal dashboards after deployment.
- Current PayPal payment link must be fixed or replaced before deployment because the payment-link smoke check detects a
  merchant setup error page.

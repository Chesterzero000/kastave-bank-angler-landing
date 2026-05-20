# PayPal Webhook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vercel serverless PayPal webhook endpoint that verifies PayPal signatures and records `$1 USD` reservation payments.

**Architecture:** Keep the Vercel request handler thin and move webhook behavior into a testable core module. The endpoint verifies PayPal signature headers through PayPal's REST API, filters to supported payment events, validates completed captures as `$1 USD`, and writes webhook results to Supabase when server credentials are present.

**Tech Stack:** Vercel Serverless Functions, Node.js ESM, PayPal Webhooks v1 API, Supabase REST API, Node test runner.

---

### Task 1: Core Webhook Behavior

**Files:**
- Create: `api/paypalWebhookCore.js`
- Test: `api/paypalWebhookCore.test.js`

- [ ] Write failing tests for supported event filtering, amount validation, signature verification request shape, and Supabase insert payload.
- [ ] Run `node --test api/paypalWebhookCore.test.js` and confirm the tests fail because the module does not exist.
- [ ] Implement the core functions with dependency-injected `fetch` and `env`.
- [ ] Run `node --test api/paypalWebhookCore.test.js` and confirm the tests pass.

### Task 2: Vercel API Route

**Files:**
- Create: `api/paypal-webhook.js`
- Modify: `vercel.json`
- Test: `api/paypalWebhookRoute.test.js`

- [ ] Write failing route tests for non-POST rejection and successful webhook handling.
- [ ] Run `node --test api/paypalWebhookRoute.test.js` and confirm the tests fail because the route does not exist.
- [ ] Implement the Vercel handler and update SPA rewrite so `/api/*` routes are not swallowed by `index.html`.
- [ ] Run route tests and confirm they pass.

### Task 3: Project Verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] Add required PayPal server environment variables to `.env.example`.
- [ ] Document PayPal webhook setup steps in `README.md`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Deploy with `npx vercel deploy --prod --yes`.

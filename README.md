# Kastave 岸钓侦察员落地页

这是用于验证 **Kastave Bank Angler Scout Program** 的 React/Vite 独立站项目，目标用户是美国 bass bank anglers / bank fishing / shore fishing 人群。

项目重点验证：用户是否愿意为“岸钓找鱼效率提升、陌生水域结构判断、便携式 fish finder / castable sonar 替代方案”留下邮箱，并支付 `$1` founder reservation 以获得 `$100` launch credit。

## 文档目录

- [项目结构](docs/项目结构.md)
- [运行与部署](docs/运行与部署.md)
- [转化追踪](docs/转化追踪.md)
- [Kastave V2 验收清单](docs/kastave-v2-acceptance-checklist.md)
- [Kastave V2 素材脚本](docs/kastave-v2-media-scripts.md)

## 核心目录

- `src/`：React 页面、内容、样式、追踪与 Supabase 写入逻辑
- `api/`：Vercel serverless webhook endpoints
- `assets/`：落地页、产品图、目标用户和支付页素材
- `public/`：公开静态资源和 favicon
- `supabase/migrations/`：Supabase 数据库迁移 SQL
- `skills/american-bass-angler-copy/`：美国岸钓用户文案 skill 和语言参考
- `skills/github-upload/`：GitHub 上传和排障 skill
- `docs/kastave-v2-media-scripts.md`：V2 首页素材拍摄/生成脚本
- `scripts/`：构建后处理脚本

## 本地运行

```bash
npm install
npm run dev
```

Codex 桌面环境如果没有 `npm` / `npx`，但依赖已存在，可以直接运行：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js --host 0.0.0.0
```

## 构建

```bash
npm run build
```

Codex bundled Node 构建命令：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/create-spa-fallback.mjs
```

Vercel 输出目录：`dist`。

## 上线前检查

```bash
npm run preflight
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/preflight.mjs
```

`preflight` 会依次执行测试、项目结构检查、素材引用检查、部署目标检查、React 渲染 smoke test、生产构建、SPA fallback 校验、生产预览路由 smoke test 和敏感信息扫描。
当前测试入口包含 `src/`、`api/` 和 `scripts/` 下的测试。

`preflight` 是本地验收门禁，不要求真实生产密钥。正式上线前还要执行 `deploy:ready`，它会先跑完整 `preflight`，再检查生产 Stripe、PayPal、Supabase 和 Meta Pixel 环境变量，并检查公开 Stripe / PayPal payment link 是否能打开。`preflight` 失败时会立即停止；生产 env 和支付链接会尽量都跑完并汇总阻断项。

```bash
npm run deploy:ready
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/deploy-ready.mjs
```

单独检查项目结构是否仍然只保留当前 V2 独立站交付物：

```bash
npm run check:structure
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-project-structure.mjs
```

单独检查 V2 素材是否存在、源码是否引用旧资产：

```bash
npm run check:assets
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-assets.mjs
```

单独检查部署目标是否仍然是 Vercel、webhook 和 SPA fallback 配置是否完整：

```bash
npm run check:deploy-target
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-deploy-target.mjs
```

单独检查 React 渲染后的 CTA / 支付 / legal 页面，以及内部锚点、内部路由和外部支付链接白名单：

```bash
npm run render:smoke
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-smoke.mjs
```

单独检查生产预览路由：

```bash
npm run preview:smoke
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/preview-smoke.mjs
```

## 生产环境变量检查

```bash
npm run check:prod-env
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-production-env.mjs
```

这个检查用于 Vercel 生产环境。它不会部署，也不会打印密钥值；只会报告缺失或格式明显不对的 Stripe、PayPal、Supabase 和 Meta Pixel 环境变量。

如果不想手动 `export` 环境变量，可以创建本地私有文件 `.env.production.local`。这个文件会被 `.gitignore` 忽略，不应提交到 GitHub。`check:prod-env`、`check:payment-links` 和 `deploy:ready` 会自动读取它；也可以显式指定：

```bash
npm run check:prod-env -- --kastave-env-file .env.production.local
npm run check:payment-links -- --kastave-env-file .env.production.local
npm run deploy:ready -- --kastave-env-file .env.production.local
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-production-env.mjs --kastave-env-file .env.production.local
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-payment-links.mjs --kastave-env-file .env.production.local
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/deploy-ready.mjs --kastave-env-file .env.production.local
```

单独检查 Stripe / PayPal payment link 是否可访问、是否返回常见商户错误页：

```bash
npm run check:payment-links
```

没有 `npm` / `npx` 时：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-payment-links.mjs
```

这个检查会访问公开支付链接，但不会输入付款信息，也不会完成付款。

上线判断标准：

1. `npm run preflight` 本地通过。
2. 你完成本地页面视觉把关。
3. Vercel 配置真实生产环境变量后，`npm run deploy:ready` 通过。
4. Stripe / PayPal 后台回跳 URL 和 webhook 都已经配置到 `kastave.com`。

## 环境变量

复制 `.env.example` 为 `.env.production.local`，填入真实生产值后再同步到 Vercel Production Environment Variables。不要提交 `.env.production.local`。

```bash
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00
STRIPE_WEBHOOK_SECRET=
VITE_PAYPAL_PAYMENT_LINK=https://www.paypal.com/ncp/payment/REPLACE_WITH_LIVE_LINK
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=live
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VITE_BEEHIIV_FORM_URL=
VITE_GA_MEASUREMENT_ID=
VITE_META_PIXEL_ID=1542765323857764
VITE_META_CAPI_ENDPOINT=
VITE_TIKTOK_PIXEL_ID=
VITE_PLAUSIBLE_DOMAIN=kastave.com
VITE_SURVEY_URL=
```

Recommended first production links:

- Stripe: `$1` payment link for `Kastave Bank Angler Scout Program`
- PayPal: second `$1` payment channel for `Kastave Bank Angler Scout Program`
- Supabase: project URL and anon key for landing-page metrics storage
- Beehiiv: public subscribe form URL
- Survey: Tally or Google Form URL

Payment copy should stay clear: the `$1` is a non-refundable early reservation deposit and unlocks a `$100` launch credit.

## Reservation Flow

Current V2 flow:

1. Homepage `Sign up` collects email and routes to `/deposit`.
2. Homepage `Reserve for $1` routes to `/deposit`.
3. `/deposit` explains the founder reservation and shows two payment choices.
4. `Credit Card` opens the Stripe payment link.
5. `PayPal` opens the PayPal payment link.

Do not change the homepage CTA back to direct PayPal or direct Stripe unless it is a deliberate emergency hotfix.

## Stripe Payment

Production payment link:

```txt
https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00
```

Set this Vercel environment variable so the `/deposit` page can open the live Stripe checkout. Homepage reservation CTAs should route to `/deposit` first, then let the visitor choose Stripe or PayPal:

```txt
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00
```

In Stripe Payment Links, set the post-payment redirect to:

```txt
https://kastave.com/thanks?provider=stripe
```

## PayPal Payment

Production payment link:

```txt
https://www.paypal.com/ncp/payment/REPLACE_WITH_LIVE_LINK
```

Set this Vercel environment variable so the `/deposit` page can open the live PayPal checkout:

```txt
VITE_PAYPAL_PAYMENT_LINK=https://www.paypal.com/ncp/payment/REPLACE_WITH_LIVE_LINK
```

If PayPal supports a return URL for this payment link, set it to:

```txt
https://kastave.com/thanks?provider=paypal
```

## Stripe Webhook

Production webhook endpoint:

```txt
https://kastave.com/api/stripe-webhook
```

Configure this endpoint in the Stripe Dashboard and subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

Set these Vercel environment variables:

```txt
STRIPE_WEBHOOK_SECRET=whsec_your-live-webhook-secret
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Do not commit Stripe secrets to this repository. If a webhook secret is shared in chat or copied into a file by mistake, rotate it in the Stripe Dashboard before using it in production.

## PayPal Webhook

Production webhook endpoint:

```txt
https://kastave.com/api/paypal-webhook
```

Configure this endpoint in the PayPal Developer Dashboard for the Live app and subscribe to:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`

Set these Vercel environment variables:

```txt
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-client-secret
PAYPAL_WEBHOOK_ID=the-webhook-id-from-paypal
PAYPAL_ENV=live
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Do not commit PayPal secrets to this repository. If a client secret is shared in chat or copied into a file by mistake, rotate it in PayPal Developer Dashboard before using it in production.

## Supabase Backend

Run the SQL files in `supabase/migrations/` in order in your Supabase project SQL editor.

It creates:

- `landing_events`: page views, CTA clicks, email submits, and payment clicks
- `waitlist_signups`: normalized email signups
- `reservation_intents`: Stripe or PayPal reservation button clicks, not completed payment confirmations
- `purchase_events`: completed Stripe or PayPal `$1` reservation payments from the webhook
- `landing_metric_summary`: authenticated-only summary view by A/B variant

The frontend writes to Supabase only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. The Stripe and PayPal webhooks write completed payments from Vercel serverless endpoints when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.

`landing_metric_summary` includes:

- Landing Page View / Link Click ratio
- Average time on page from `page_engagement`
- CTA click rate
- Email Lead conversion rate
- Checkout start rate
- Verified `$1` purchase rate from `purchase_events`
- FAQ expand rate

## 中文命名

当前 GitHub 仓库名：`kastave-bank-angler-landing`  
原仓库名：`ai-`  
中文项目名：`Kastave 岸钓侦察员落地页`

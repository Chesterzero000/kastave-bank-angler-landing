# Kastave 岸钓侦察员落地页

这是用于验证 **Kastave Bank Angler Scout Program** 的 React/Vite 落地页项目，目标用户是美国 bass bank anglers / bank fishing / shore fishing 人群。

项目重点验证：用户是否愿意为“岸钓找鱼效率提升、陌生水域结构判断、便携式 fish finder / castable sonar 替代方案”留下邮箱、填写痛点、点击预约或支付 `$1` 早鸟订金。

## 文档目录

- [项目结构](docs/项目结构.md)
- [运行与部署](docs/运行与部署.md)
- [仓库重命名方案](docs/仓库重命名方案.md)
- [仓库重命名接口设计](docs/仓库重命名接口设计.md)

## 核心目录

- `src/`：React 页面、内容、样式、追踪与 Supabase 写入逻辑
- `api/`：Vercel serverless webhook endpoints
- `assets/`：落地页、产品图、社媒广告素材
- `public/`：公开静态资源、域名和 favicon
- `supabase/migrations/`：Supabase 数据库迁移 SQL
- `skills/american-bass-angler-copy/`：美国岸钓用户文案 skill 和语言参考
- `.github/workflows/`：GitHub Pages 自动部署配置
- `scripts/`：构建后处理脚本

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

Vercel 输出目录：`dist`。

## 环境变量

复制 `.env.example` 为 `.env.local`，本地测试后再同步到 Vercel。

```bash
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00
STRIPE_WEBHOOK_SECRET=
VITE_PAYPAL_PAYMENT_LINK=
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

## Stripe Payment

Production payment link:

```txt
https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00
```

Set this Vercel environment variable so every reservation CTA opens the live Stripe checkout:

```txt
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00
```

In Stripe Payment Links, set the post-payment redirect to:

```txt
https://kastave.com/thanks?provider=stripe
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

- `landing_events`: page views, CTA clicks, email submits, payment clicks, and popup events
- `waitlist_signups`: normalized email signups
- `pain_point_answers`: bank-fishing pain point responses
- `reservation_intents`: Stripe or PayPal reservation button clicks, not completed payment confirmations
- `purchase_events`: completed Stripe or PayPal `$1` reservation payments from the webhook
- `landing_metric_summary`: authenticated-only summary view by A/B variant

The frontend writes to Supabase only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. The Stripe and PayPal webhooks write completed payments from Vercel serverless endpoints when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.

`landing_metric_summary` includes:

- Landing Page View / Link Click ratio
- Average time on page from `page_engagement`
- CTA click rate
- Email Lead conversion rate
- `$1` reservation click conversion rate
- FAQ expand rate

## 中文命名

当前 GitHub 仓库名：`kastave-bank-angler-landing`  
原仓库名：`ai-`  
中文项目名：`Kastave 岸钓侦察员落地页`

# 2026-05-23 Progress

## Status

Stripe and PayPal are both available as live `$1` reservation payment channels on the Kastave landing page.

## Completed

- Changed the displayed single target product price to the `$600-$1,000` range.
- Added visible dual payment choices: `Pay with Stripe` and `Pay with PayPal`.
- Kept Stripe webhook support at `/api/stripe-webhook` with signature verification.
- Kept PayPal webhook support at `/api/paypal-webhook`.
- Updated tests to cover the dual payment path and price range.

## Deployment Notes

- Production site: `https://kastave.com`
- Stripe payment link: configured through `VITE_STRIPE_PAYMENT_LINK`.
- Stripe webhook secret: configured in Vercel Production as `STRIPE_WEBHOOK_SECRET`.
- PayPal payment link: configured through `VITE_PAYPAL_PAYMENT_LINK`.

Do not commit payment provider secrets. If a Stripe webhook secret appears in chat or a file, rotate it in Stripe and update Vercel.

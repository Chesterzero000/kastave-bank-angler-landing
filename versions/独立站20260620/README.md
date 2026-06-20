# 独立站20260620 稳定版

记录时间：2026-06-20

## 版本定位

这是 2026-06-20 已验证可上线的 Kastave 独立站稳定版本。它不是 React/Vite 源码开发版，而是当前线上可直接部署的静态站发布包，并附带 Cloudflare Worker 域名代理配置。

## 目录

- `site/`：Cloudflare Pages 静态站发布包。
- `site/index.html`：页面 HTML，包含 Stripe 与 PayPal 付款入口。
- `site/styles.css`：页面样式。
- `site/script.js`：轮播、视频播放、转化追踪、PayPal 按钮兜底逻辑。
- `site/assets/`：当前页面依赖的图片与视频素材。
- `cloudflare-worker/`：正式域名代理到 Cloudflare Pages 的 Worker 配置。

## 线上关系

- 正式域名：`https://kastave.com`
- 正式域名：`https://www.kastave.com`
- Cloudflare Pages 项目：`v1`
- Cloudflare Pages 默认域：`https://v1-c9l.pages.dev`
- 当前稳定预览部署：`https://e41abc17.v1-c9l.pages.dev`
- Worker 名称：`kastave-paypal-pages-proxy`
- Worker 路由：`kastave.com/*`、`www.kastave.com/*`

## 支付链接

- Stripe：`https://buy.stripe.com/9B69AVbpieTIcPx9rBd7q00`
- PayPal：`https://www.paypal.com/ncp/payment/6W9PTBNB267ZW`

## 已验证项

- `kastave.com` 返回包含 PayPal 的新 HTML。
- `www.kastave.com` 返回包含 PayPal 的新 HTML。
- `site/index.html` 本地资源引用完整。
- PayPal 链接 HTTP 请求返回 `200`。
- 未执行真实付款。

## 文件校验

```text
861cbbd9acf5d9da71c8e346bdceec43889f3822e25cc3c05f2ab5437895ed58  site/index.html
e350ad1849e12d38dd984fc1ad07127a6342037b1e58d7c6dcdef1255ff33de6  site/script.js
d3ecfe3319eae83ca8946ad84f73522ef5ed44b656ebb369b2b34d49c28d7dbc  cloudflare-worker/worker.js
```

## 后续维护建议

短期线上热修优先改 `site/` 并重新部署 Cloudflare Pages。长期开发应回到 React/Vite 源码工程，整理后从源码构建稳定发布包，避免静态包和源码继续分叉。

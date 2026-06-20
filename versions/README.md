# Kastave 版本归档

本目录用于在 GitHub 中同时保存 Kastave 独立站的旧版和当前线上新版。

## 文件夹

- `previous-react-vercel/`：部署新版静态站之前，GitHub `origin/main` 上的旧版 React/Vite + Vercel 项目源码，包含 API webhook、Supabase、脚本和文档；不包含 `.git`、`node_modules`、`dist`、`.vercel` 或本地环境变量。
- `current-static-live/`：2026-06-04 当前线上新版静态站，已包含 Meta Pixel、手机首屏产品露出修正和手机端对比表卡片展示。
- `独立站20260620/`：2026-06-20 已验证可上线的稳定静态站版本，包含 PayPal 付款入口、Cloudflare Pages 发布包和 Cloudflare Worker 域名代理配置。

## 当前线上地址

- 主域名：`https://kastave.com`
- Cloudflare Pages 部署：`https://v1-c9l.pages.dev`
- Cloudflare Pages 稳定预览：`https://e41abc17.v1-c9l.pages.dev`
- Cloudflare Worker：`kastave-paypal-pages-proxy`

## 注意

这些版本目录用于归档和对比。2026-06-20 起，实际线上 `kastave.com` 通过 Cloudflare Worker 代理到 Cloudflare Pages 项目 `v1`，当前稳定内容记录在 `独立站20260620/`。

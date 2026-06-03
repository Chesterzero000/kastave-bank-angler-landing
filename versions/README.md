# Kastave 版本归档

本目录用于在 GitHub 中同时保存 Kastave 独立站的旧版和当前线上新版。

## 文件夹

- `previous-react-vercel/`：部署新版静态站之前，GitHub `origin/main` 上的旧版 React/Vite + Vercel 项目源码，包含 API webhook、Supabase、脚本和文档；不包含 `.git`、`node_modules`、`dist`、`.vercel` 或本地环境变量。
- `current-static-live/`：2026-06-04 当前线上新版静态站，已包含 Meta Pixel、手机首屏产品露出修正和手机端对比表卡片展示。

## 当前线上地址

- 主域名：`https://kastave.com`
- Vercel 生产部署：`https://ai-64dgap0ts-kastave.vercel.app`
- Cloudflare Pages 部署：`https://v1-c9l.pages.dev`

## 注意

两个版本目录用于归档和对比。实际线上 `kastave.com` 目前由 Vercel 项目 `ai` 提供服务，页面内容使用 `current-static-live/`，API functions 仍来自旧版 Vercel 项目。

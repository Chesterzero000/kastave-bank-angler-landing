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
VITE_PAYPAL_PAYMENT_LINK=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BEEHIIV_FORM_URL=
VITE_GA_MEASUREMENT_ID=
VITE_META_PIXEL_ID=
VITE_TIKTOK_PIXEL_ID=
VITE_PLAUSIBLE_DOMAIN=kastave.com
VITE_SURVEY_URL=
```

## 数据与转化

Supabase 迁移会创建：

- `landing_events`：页面访问、CTA、邮箱提交、PayPal 点击、弹窗事件
- `waitlist_signups`：邮箱报名
- `pain_point_answers`：岸钓痛点回答
- `reservation_intents`：PayPal 预约按钮点击
- `landing_metric_summary`：A/B 版本维度的数据汇总

PayPal 完成支付仍需要 PayPal 后台导出或 webhook 服务端确认。

## 中文命名

当前 GitHub 仓库名：`ai-`  
建议仓库 slug：`kastave-bank-angler-landing`  
中文项目名：`Kastave 岸钓侦察员落地页`
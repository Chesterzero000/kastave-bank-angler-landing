# GitHub 上传排障与操作细节

## 这次 Kastave 案例沉淀

问题链路：

- 本地仓库在 `/Users/chester/ai/kastave-bank-angler-landing`。
- 本地 `main` 曾经 `ahead 3`，普通 `git push origin main` 失败。
- HTTPS 报错：`fatal: could not read Username for 'https://github.com': Device not configured`。
- SSH 报错：`git@github.com: Permission denied (publickey)`。
- 本机当时没有可用的 `gh`、`vercel`、`npm`、`npx`。
- 线上急需修复 `Reserve for $1` 点击后滚动到下方，而不是进入预订/支付路径。

解决策略：

- 先确认本地代码已经有正确逻辑并通过测试。
- 因为 Git 凭据不可用，改用 GitHub connector。
- 发现远端 `origin/main` 仍然是旧逻辑，且本地改动跨多个文件。
- 为避免只上传一个依赖其他文件的 React 改动导致构建风险，当时选择一个独立入口热修复：在 `index.html` 增加捕获阶段 click listener，拦截 `Reserve for $1`。
- 当前 V2 流程已调整为先进入 `/deposit` 预订页，再让用户选择 Stripe 信用卡或 PayPal；不要继续把首页 CTA 直接写成 PayPal。
- 用 `_fetch_file` 获取远端 `index.html` 与 SHA，再用 `_update_file` 写入完整替换内容。
- 获取远端提交，线上 `curl https://kastave.com` 确认出现目标路径、关键拦截逻辑或预期资源。
- 用 Browser/Chrome/Playwright 只验证跳转 URL 或付款选项显示，不提交付款。

历史热修复提交：

- `9cae0952a5dccb875d97202113f5e7c0b8293957`
- Message: `Route reserve button directly to PayPal`
- 备注：这是历史热修复提交，不代表当前 V2 首页应直接跳 PayPal。当前 V2 的目标状态是首页进入 `/deposit`，再让用户选择 Stripe 信用卡或 PayPal。

## 当前 Kastave V2 上传规则

完整上传当前独立站时，必须保持以下状态：

- 首页 `Sign up` 和 `Reserve for $1` 进入 `/deposit`。
- `/deposit` 才展示 `Credit Card` 和 `PayPal` 两种支付方式。
- 不要把首页 CTA 改回直接打开 PayPal 或 Stripe。
- 保留 Meta Pixel `1542765323857764`。
- 保留 Vercel serverless webhook：`/api/stripe-webhook` 与 `/api/paypal-webhook`。
- 不要恢复 GitHub Pages workflow 或 `public/CNAME`。
- 不要上传真实 `STRIPE_WEBHOOK_SECRET`、`PAYPAL_CLIENT_SECRET`、`SUPABASE_SERVICE_ROLE_KEY`。

上传前优先运行：

```bash
node scripts/preflight.mjs
```

生产部署前，在真实 Vercel production 环境变量配置完成后运行：

```bash
node scripts/deploy-ready.mjs
```

## 上传前检查

始终先读现场：

```bash
pwd
git status --short --branch
git remote -v
git log --oneline --decorate --max-count=8
git diff --stat
git diff --name-status
```

如果用户说“只保留最新版本代码”，先找到真正的活跃仓库和线上来源，不要随手删除目录。优先用 `rg --files`、`git status`、远端 URL、构建配置、线上页面资源名来判断。

## 测试与验证

优先使用仓库已有脚本。没有 `npm` 时可以直接用可用 Node 跑 node:test：

```bash
/Users/chester/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test src/**/*.test.js api/**/*.test.js
```

缺少包管理器或构建工具时，明确说明限制，不要假装已经构建。

## GitHub Connector 写入细节

单文件更新：

1. `_fetch_file` 完整拉取远端文件，保存 `sha`。
2. 用完整文件内容调用 `_update_file`。
3. 不要并行更新同一路径。
4. 用 `_fetch_commit` 查看 diff 与提交 URL。

多文件更新：

1. 用 `_get_repo` 或提交信息确认远端默认分支与当前 SHA。
2. 为每个文件创建 blob。
3. 基于远端 base tree 创建新 tree。
4. 创建 commit，parent 指向当前远端分支 HEAD。
5. `_update_ref` 推进分支。除非用户明确授权，不要 force。

选择热修复还是完整上传：

- 如果本地改动很多，并且用户只要求立刻修线上一个交互问题，选择最小热修复更安全。
- 如果修改涉及组件、内容、样式相互依赖，必须成组上传，不能只推一个文件。
- 如果 connector 直接写了远端，本地 `origin/main` 不会自动更新。最终答复要提醒本地需要后续 fetch/rebase。

## 线上检查

HTML/资源检查：

```bash
curl -L --max-time 20 -s https://kastave.com | rg -n "expected-string|payment-link|assets/index"
```

如果需要检查打包 JS：

```bash
asset=$(curl -L -s https://kastave.com | sed -n 's/.*src="\([^"]*assets\/index[^"]*\.js\)".*/\1/p' | head -1)
curl -L -s "https://kastave.com${asset}" | rg "expected-function|old-bug-string"
```

交互检查：

- 首选 Browser/Chrome 插件或 Playwright。
- 如果 Playwright 自带浏览器缺失，可尝试系统 Chrome：

```js
const { chromium } = await import("playwright");
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
```

支付类检查只验证跳转到支付页或显示付款选项。不要输入真实卡号、不要点击最终支付、不要制造不可逆交易。

## 回答用户时要交代

最终答复至少包含：

- 是否已上传到 GitHub。
- commit SHA/链接。
- 改了什么。
- 验证结果。
- 还有哪些限制，例如本地凭据仍未配置、线上 CDN 可能有短暂缓存、本地分支与远端需要后续同步。

## 安全边界

- 不要运行 `git reset --hard`、`git checkout -- <file>`、强推、删除远端分支，除非用户明确要求。
- 不要覆盖不相关的用户改动。
- 不要在日志或技能中保存 token、cookie、私钥或支付敏感信息。
- 不要把一次临时热修复包装成完整功能发布；要清楚区分 hotfix 与 full sync。

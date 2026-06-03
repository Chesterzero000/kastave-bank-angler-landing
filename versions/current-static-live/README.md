# Kastave Landing Page

这是一个可以直接上传到 Cloudflare Pages 的静态预售落地页。

## 上传到 Cloudflare Pages

1. 打开 Cloudflare Dashboard。
2. 进入 `Workers & Pages`。
3. 选择 `Create application`。
4. 选择 `Pages`。
5. 如果你不想连 Git，选择 `Upload assets`。
6. 上传这个 `site` 文件夹里的全部文件。
7. 部署成功后，进入项目的 `Custom domains`，绑定你的域名。

## 上线前要替换的内容

- `index.html` 里的产品名：现在是 `Kastave`。
- `index.html` 里的 waitlist 链接：当前已配置 Tally 表单。
- `index.html` 里的支付按钮：当前已配置 Stripe 和 PayPal 付款链接。
- 定金金额、预计售价、发货时间和退款政策。
- 如果有真实产品图、App 截图、3D 地形截图，可以替换当前的浏览器生成视觉。

## 建议支付链路

当前页面已接入 Stripe Payment Link 和 PayPal 付款链接。

Webhook secret 不要写入静态网站前端代码；如果已经在聊天或公开位置暴露，请在支付后台重新生成。

## 本地预览

在这个目录运行：

```bash
python3 -m http.server 8788
```

然后打开：

```text
http://localhost:8788
```

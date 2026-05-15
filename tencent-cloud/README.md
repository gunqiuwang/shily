# Shily 腾讯云 DeepSeek 接入

## 推荐方案

使用腾讯云开发 CloudBase 云函数 + HTTP 访问服务：

```text
小程序 Shily 页 -> HTTPS 云函数 -> DeepSeek API
```

这样 `DEEPSEEK_API_KEY` 只放在腾讯云环境变量里，不会进入小程序包。

## 创建云函数

1. 进入腾讯云开发 CloudBase 控制台。
2. 创建环境，或使用已有环境。
3. 新建云函数，名称建议：`shily-chat`。
4. 运行环境选择 Node.js 18 或 Node.js 20。
5. 上传 `tencent-cloud/shily-chat` 目录内的文件。
6. 配置环境变量：

```text
DEEPSEEK_API_KEY=你的 DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
SHILY_DEFAULT_VOICE_PROFILE=direct
```

`SHILY_DEFAULT_VOICE_PROFILE` 可选值：`direct`、`warm`、`coach`、`analytic`、`light`。当前发布建议保持 `direct`。

## 开启 HTTP 访问

在 CloudBase 控制台进入「HTTP 访问服务」，把云函数 `shily-chat` 关联为 HTTP 接口。

建议路径：

```text
/api/shily-chat
```

生成的地址类似：

```text
https://你的环境域名/api/shily-chat
```

## 接入小程序

把项目根目录 `.env` 里的 `SHILY_CHAT_ENDPOINT` 改成腾讯云 HTTPS 地址：

```text
SHILY_CHAT_ENDPOINT=https://你的环境域名/api/shily-chat
```

然后重新构建：

```bash
npm run build:weapp
```

## 微信后台

在微信公众平台小程序后台，把云函数 HTTPS 域名加入：

```text
开发管理 -> 开发设置 -> 服务器域名 -> request 合法域名
```

只填写域名，不填写路径。

## 发布前验证

1. 本地语法检查：

```bash
node --check tencent-cloud/shily-chat/index.js
```

2. 小程序端检查：

```bash
npx tsc --noEmit
npm run build:weapp
```

3. 云函数 HTTP 自测：

```bash
curl -X POST "https://你的环境域名/api/shily-chat" \
  -H "content-type: application/json" \
  -d "{\"message\":\"外卖怎么点\",\"history\":[],\"context\":{\"quickActions\":[\"今天怎么吃更稳\",\"外卖怎么点\"]}}"
```

期望返回 JSON，且包含：

```json
{
  "reply": "...",
  "mood": "normal",
  "quickActions": ["今天怎么吃更稳", "外卖怎么点"]
}
```

4. 微信开发者工具真机预览：

- Shily 页能正常返回 DeepSeek 或 fallback 回复。
- 返回内容不出现“我在的”“慢慢来”“抱抱你”“正在看你的今天”等旧文案。
- 请求失败时小程序仍显示本地 fallback，不阻断对话。
- 今日 AI 次数用完后显示次数耗尽文案，不继续请求云函数。

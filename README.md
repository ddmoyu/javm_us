# JAVM M3U8 Helper

> 浏览器油猴脚本 —— 自动检测网页中的 m3u8 视频流，一键唤起 [JAVM](https://github.com/ddmoyu/javm) 下载或调用本地播放器播放。

## ✨ 功能

- **自动检测 m3u8** — Hook `Response.prototype.text` + `XMLHttpRequest`，实时捕获页面中加载的 m3u8 流
- **JAVM 下载** — 通过 `javm://download` deeplink 一键唤起 JAVM 添加下载任务
- **多播放器支持** — 内置 PotPlayer / VLC / MPC-HC / MPV 协议调用
- **自定义播放器** — 可手动添加任意播放器，支持协议模板 `{url}` / `{encoded_url}`
- **开关控制** — 每个播放器可单独启用/禁用，设置持久化存储
- **复制链接** — 一键复制 m3u8 地址到剪贴板
- **现代化 UI** — Glassmorphism 风格面板，流畅动画，不影响网页布局

## 📦 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 从 [Releases](https://github.com/ddmoyu/javm_us/releases) 下载 `javm_us.user.js` 安装

## 🛠 开发

```bash
# 安装依赖
bun install

# 开发模式（自动安装到 Tampermonkey）
bun run dev

# 构建
bun run build
```

构建产物：`dist/javm_us.user.js`

## 📐 技术栈

- [Vite](https://vitejs.dev/) + [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey)
- [Vue 3](https://vuejs.org/) + TypeScript
- GM API (`GM_setClipboard` / `GM_setValue` / `GM_getValue` / `unsafeWindow`)

## 📄 协议

MIT

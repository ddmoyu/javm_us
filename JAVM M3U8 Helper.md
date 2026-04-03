# JAVM M3U8 Helper

> 自动检测网页中的 m3u8 视频流，一键唤起 JAVM 下载或调用本地播放器播放。

## ✨ 功能特性

### 🔍 智能检测

- Hook `Response.prototype.text` 和 `XMLHttpRequest`，实时拦截页面中加载的 m3u8/m3u 流
- 自动扫描 `<video>` / `<source>` 标签
- 支持 SPA 单页应用，`MutationObserver` 持续监听 DOM 变化
- 右下角气泡实时显示检测到的流数量

### ⬇️ JAVM 一键下载

- 通过 `javm://download` 深度链接直接唤起 JAVM 桌面应用
- 自动使用当前浏览器页面标题作为下载文件名

### 🎬 多播放器支持

| 播放器 | 协议 |
| --- | --- |
| PotPlayer | `potplayer://` |
| VLC | `vlc://` |
| MPC-HC | `mpc-hc://open/file` |
| MPV | `mpv://play/` |

### ⚙️ 自定义播放器

- 可手动添加任意支持协议调用的播放器
- 支持模板变量：`{url}`（原始链接）和 `{encoded_url}`（URL 编码后的链接）
- 每个播放器可独立开关，关闭后不在操作栏显示
- 设置自动持久化，刷新页面不会丢失

### 📋 其他功能

- 一键复制 m3u8 地址到剪贴板
- 自动识别分辨率标记（1080p、720p、4K 等）

## 📦 安装方式

1. 安装浏览器扩展 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 点击安装脚本：[javm_us.user.js](javm_us.user.js)
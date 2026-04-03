// ==UserScript==
// @name         JAVM M3U8 Helper
// @namespace    bidbadegg/javm-m3u8-helper
// @version      1.1.1
// @author       BidBadEgg
// @description  检测页面中的 m3u8 链接，一键唤起 JAVM 下载或调用播放器
// @license      MIT
// @icon         https://raw.githubusercontent.com/BidBadEgg/javm/main/src-tauri/icons/32x32.png
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.5.32/dist/vue.global.prod.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_openInTab
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function (vue) {
  'use strict';

  const d=new Set;const t = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):(document.head||document.documentElement).appendChild(document.createElement("style")).append(t);})(e));};

  t(' .javm-root[data-v-7ccd7aa3]{all:initial;position:fixed!important;z-index:2147483647!important;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,sans-serif!important;font-size:13px!important;line-height:1.4!important;display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:12px!important;-webkit-font-smoothing:antialiased!important}.javm-bubble-wrap[data-v-7ccd7aa3]{position:relative!important;width:48px!important;height:48px!important}.javm-bubble-ring[data-v-7ccd7aa3]{position:absolute!important;inset:-4px!important;border-radius:50%!important;border:2px solid rgba(99,102,241,.4)!important;animation:javm-ring-pulse-7ccd7aa3 2s ease-in-out infinite!important;pointer-events:none!important}@keyframes javm-ring-pulse-7ccd7aa3{0%,to{transform:scale(1);opacity:.5}50%{transform:scale(1.15);opacity:0}}.javm-bubble[data-v-7ccd7aa3]{all:unset;position:relative!important;width:48px!important;height:48px!important;border-radius:16px!important;background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)!important;color:#fff!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 4px 15px #6366f166,0 1px 3px #0003,inset 0 1px #ffffff26!important;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease,border-radius .25s ease!important;-webkit-user-select:none!important;user-select:none!important}.javm-bubble[data-v-7ccd7aa3]:before{content:""!important;position:absolute!important;inset:0!important;border-radius:inherit!important;background:linear-gradient(135deg,rgba(255,255,255,.2) 0%,transparent 50%)!important;pointer-events:none!important}.javm-bubble[data-v-7ccd7aa3]:hover{transform:translateY(-2px) scale(1.08)!important;box-shadow:0 8px 25px #6366f180,0 2px 8px #0003,inset 0 1px #fff3!important;border-radius:14px!important}.javm-bubble.pressed[data-v-7ccd7aa3]{transform:translateY(0) scale(.95)!important;box-shadow:0 2px 8px #6366f14d,inset 0 2px 4px #00000026!important}.javm-bubble.active[data-v-7ccd7aa3]{background:linear-gradient(135deg,#4f46e5,#7c3aed)!important;border-radius:14px!important}.javm-bubble.dragging[data-v-7ccd7aa3]{cursor:grabbing!important;transform:scale(1.12)!important;box-shadow:0 10px 30px #6366f180,0 2px 8px #0000004d,inset 0 1px #fff3!important;transition:none!important}.javm-bubble-icon[data-v-7ccd7aa3]{width:20px!important;height:20px!important;flex-shrink:0!important;opacity:.9!important}.javm-bubble-num[data-v-7ccd7aa3]{position:absolute!important;top:-6px!important;right:-6px!important;min-width:20px!important;height:20px!important;border-radius:10px!important;background:#ef4444!important;color:#fff!important;font-size:11px!important;font-weight:700!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 5px!important;box-shadow:0 2px 6px #ef444466!important;animation:javm-num-pop-7ccd7aa3 .3s cubic-bezier(.34,1.56,.64,1)!important;z-index:1!important}@keyframes javm-num-pop-7ccd7aa3{0%{transform:scale(0)}to{transform:scale(1)}}.javm-panel[data-v-7ccd7aa3]{all:unset;display:block!important;width:500px!important;max-height:440px!important;background:#0f0f1aeb!important;backdrop-filter:blur(20px) saturate(1.5)!important;-webkit-backdrop-filter:blur(20px) saturate(1.5)!important;border:1px solid rgba(99,102,241,.15)!important;border-radius:16px!important;box-shadow:0 20px 60px #00000080,0 0 0 1px #ffffff0d,0 0 80px -20px #6366f126!important;overflow:hidden!important;color:#e2e8f0!important;position:relative!important}.javm-panel-glow[data-v-7ccd7aa3]{position:absolute!important;top:0!important;left:0!important;right:0!important;height:80px!important;background:linear-gradient(180deg,rgba(99,102,241,.08),transparent)!important;pointer-events:none!important}.javm-panel-header[data-v-7ccd7aa3]{position:relative!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:14px 16px!important;border-bottom:1px solid rgba(255,255,255,.06)!important}.javm-panel-title-area[data-v-7ccd7aa3]{display:flex!important;align-items:center!important;gap:8px!important}.javm-panel-title[data-v-7ccd7aa3]{font-weight:600!important;font-size:14px!important;color:#f1f5f9!important;letter-spacing:-.01em!important}.javm-panel-count[data-v-7ccd7aa3]{font-size:11px!important;font-weight:600!important;color:#a5b4fc!important;background:#6366f126!important;padding:2px 8px!important;border-radius:10px!important;letter-spacing:.02em!important}.javm-header-actions[data-v-7ccd7aa3]{display:flex!important;gap:4px!important}.javm-icon-btn[data-v-7ccd7aa3]{all:unset;width:30px!important;height:30px!important;border-radius:8px!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;color:#64748b!important;transition:all .2s ease!important}.javm-icon-btn svg[data-v-7ccd7aa3]{width:16px!important;height:16px!important;transition:transform .3s ease!important}.javm-icon-btn[data-v-7ccd7aa3]:hover{color:#e2e8f0!important;background:#ffffff14!important}.javm-icon-btn:hover svg[data-v-7ccd7aa3]{transform:rotate(30deg)!important}.javm-icon-btn.is-active[data-v-7ccd7aa3]{color:#a5b4fc!important;background:#6366f126!important}.javm-icon-btn.is-active svg[data-v-7ccd7aa3]{transform:rotate(90deg)!important}.javm-close-btn[data-v-7ccd7aa3]:hover{color:#fca5a5!important;background:#ef44441f!important}.javm-close-btn:hover svg[data-v-7ccd7aa3]{transform:rotate(0) scale(1.1)!important}.javm-panel-body[data-v-7ccd7aa3]{overflow-y:auto!important;max-height:370px!important;scroll-behavior:smooth!important}.javm-panel-body[data-v-7ccd7aa3]::-webkit-scrollbar{width:5px!important}.javm-panel-body[data-v-7ccd7aa3]::-webkit-scrollbar-track{background:transparent!important}.javm-panel-body[data-v-7ccd7aa3]::-webkit-scrollbar-thumb{background:#6366f140!important;border-radius:5px!important}.javm-panel-body[data-v-7ccd7aa3]::-webkit-scrollbar-thumb:hover{background:#6366f173!important}.javm-item[data-v-7ccd7aa3]{display:flex!important;align-items:center!important;gap:10px!important;padding:10px 16px!important;border-bottom:1px solid rgba(255,255,255,.04)!important;transition:all .2s ease!important;position:relative!important}.javm-item[data-v-7ccd7aa3]:before{content:""!important;position:absolute!important;left:0!important;top:0!important;bottom:0!important;width:3px!important;background:linear-gradient(180deg,#6366f1,#a855f7)!important;border-radius:0 2px 2px 0!important;opacity:0!important;transform:scaleY(.5)!important;transition:opacity .2s,transform .2s!important}.javm-item[data-v-7ccd7aa3]:last-child{border-bottom:none!important}.javm-item[data-v-7ccd7aa3]:hover{background:#6366f10f!important}.javm-item[data-v-7ccd7aa3]:hover:before{opacity:1!important;transform:scaleY(1)!important}.javm-item-info[data-v-7ccd7aa3]{display:flex!important;align-items:center!important;gap:8px!important;flex:1!important;min-width:0!important}.javm-badge[data-v-7ccd7aa3]{flex-shrink:0!important;background:#6366f11f!important;color:#a5b4fc!important;font-size:11px!important;font-weight:600!important;padding:3px 8px!important;border-radius:6px!important;white-space:nowrap!important;border:1px solid rgba(99,102,241,.1)!important;letter-spacing:.02em!important}.javm-filename[data-v-7ccd7aa3]{color:#94a3b8!important;font-size:12px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}.javm-actions[data-v-7ccd7aa3]{display:flex!important;gap:2px!important;flex-shrink:0!important;opacity:.6!important;transition:opacity .2s!important}.javm-item:hover .javm-actions[data-v-7ccd7aa3]{opacity:1!important}.javm-act-btn[data-v-7ccd7aa3]{all:unset;width:30px!important;height:30px!important;border-radius:8px!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;transition:all .2s cubic-bezier(.34,1.56,.64,1)!important;position:relative!important;color:#94a3b8!important}.javm-act-btn svg[data-v-7ccd7aa3]{width:15px!important;height:15px!important}.javm-act-btn[data-v-7ccd7aa3]:hover{transform:translateY(-2px)!important}.javm-act-btn[data-v-7ccd7aa3]:active{transform:translateY(0) scale(.92)!important}.javm-act-copy[data-v-7ccd7aa3]:hover{background:#3b82f626!important;color:#60a5fa!important}.javm-act-dl[data-v-7ccd7aa3]:hover{background:#ef444426!important;color:#f87171!important}.javm-act-player[data-v-7ccd7aa3]{font-size:15px!important}.javm-act-player[data-v-7ccd7aa3]:hover{background:#a855f726!important}.javm-settings[data-v-7ccd7aa3]{padding:4px 0!important}.javm-settings-section[data-v-7ccd7aa3]{padding:10px 16px 12px!important}.javm-settings-section+.javm-settings-section[data-v-7ccd7aa3]{border-top:1px solid rgba(255,255,255,.05)!important}.javm-settings-label[data-v-7ccd7aa3]{font-size:11px!important;color:#64748b!important;font-weight:600!important;margin-bottom:10px!important;text-transform:uppercase!important;letter-spacing:.08em!important}.javm-setting-row[data-v-7ccd7aa3]{display:flex!important;align-items:center!important;gap:10px!important;padding:6px 8px!important;border-radius:8px!important;margin:2px -8px!important;transition:background .15s!important}.javm-setting-row[data-v-7ccd7aa3]:hover{background:#ffffff08!important}.javm-setting-icon[data-v-7ccd7aa3]{font-size:16px!important;width:22px!important;text-align:center!important}.javm-setting-name[data-v-7ccd7aa3]{font-size:13px!important;font-weight:500!important;color:#e2e8f0!important;min-width:70px!important}.javm-setting-tpl[data-v-7ccd7aa3]{font-size:11px!important;color:#475569!important;flex:1!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font-family:SF Mono,Monaco,Cascadia Code,Consolas,monospace!important}.javm-setting-del[data-v-7ccd7aa3]{all:unset;cursor:pointer!important;color:#475569!important;width:22px!important;height:22px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:6px!important;transition:all .2s!important}.javm-setting-del[data-v-7ccd7aa3]:hover{color:#fca5a5!important;background:#ef44441f!important}.javm-setting-tag[data-v-7ccd7aa3]{font-size:10px!important;color:#64748b!important;background:#6366f11a!important;padding:2px 8px!important;border-radius:6px!important;font-weight:500!important}.javm-reset-btn[data-v-7ccd7aa3]{all:unset;cursor:pointer!important;font-size:11px!important;color:#a5b4fc!important;background:#6366f11f!important;padding:3px 10px!important;border-radius:6px!important;font-weight:500!important;transition:all .2s ease!important}.javm-reset-btn[data-v-7ccd7aa3]:hover{background:#6366f140!important;color:#c7d2fe!important}.javm-switch[data-v-7ccd7aa3]{position:relative!important;display:inline-block!important;width:36px!important;height:20px!important;flex-shrink:0!important}.javm-switch input[data-v-7ccd7aa3]{opacity:0!important;width:0!important;height:0!important;position:absolute!important}.javm-slider[data-v-7ccd7aa3]{position:absolute!important;cursor:pointer!important;inset:0!important;background:#ffffff14!important;border-radius:20px!important;transition:all .3s cubic-bezier(.34,1.56,.64,1)!important}.javm-slider[data-v-7ccd7aa3]:before{content:""!important;position:absolute!important;width:16px!important;height:16px!important;left:2px!important;bottom:2px!important;background:#475569!important;border-radius:50%!important;transition:all .3s cubic-bezier(.34,1.56,.64,1)!important;box-shadow:0 1px 3px #0000004d!important}.javm-switch input:checked+.javm-slider[data-v-7ccd7aa3]{background:#6366f140!important}.javm-switch input:checked+.javm-slider[data-v-7ccd7aa3]:before{transform:translate(16px)!important;background:#818cf8!important;box-shadow:0 0 8px #818cf866!important}.javm-add-form[data-v-7ccd7aa3]{display:flex!important;gap:6px!important;align-items:center!important}.javm-input[data-v-7ccd7aa3]{all:unset;background:#ffffff0a!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:8px!important;padding:7px 10px!important;font-size:12px!important;color:#e2e8f0!important;transition:all .2s ease!important}.javm-input[data-v-7ccd7aa3]::placeholder{color:#475569!important}.javm-input[data-v-7ccd7aa3]:focus{border-color:#6366f166!important;box-shadow:0 0 0 3px #6366f11a!important;background:#ffffff0f!important}.javm-input-icon[data-v-7ccd7aa3]{width:32px!important;text-align:center!important;font-size:15px!important}.javm-input-name[data-v-7ccd7aa3]{width:76px!important}.javm-input-tpl[data-v-7ccd7aa3]{flex:1!important;font-family:SF Mono,Monaco,Cascadia Code,Consolas,monospace!important;font-size:11px!important}.javm-add-btn[data-v-7ccd7aa3]{all:unset;width:32px!important;height:32px!important;border-radius:8px!important;background:#6366f126!important;color:#a5b4fc!important;display:flex!important;align-items:center!important;justify-content:center!important;cursor:pointer!important;transition:all .2s ease!important;flex-shrink:0!important}.javm-add-btn svg[data-v-7ccd7aa3]{width:16px!important;height:16px!important}.javm-add-btn[data-v-7ccd7aa3]:hover{background:#6366f140!important;color:#c7d2fe!important;transform:scale(1.05)!important}.javm-add-btn[data-v-7ccd7aa3]:active{transform:scale(.95)!important}.javm-hint[data-v-7ccd7aa3]{font-size:11px!important;color:#475569!important;margin-top:8px!important;line-height:1.6!important}.javm-hint code[data-v-7ccd7aa3]{color:#a5b4fc!important;background:#6366f11a!important;padding:1px 5px!important;border-radius:4px!important;font-size:10px!important;font-family:SF Mono,Monaco,Cascadia Code,Consolas,monospace!important}.javm-about[data-v-7ccd7aa3]{display:flex!important;flex-direction:column!important;align-items:center!important;padding:28px 24px 24px!important;gap:6px!important}.javm-about-logo[data-v-7ccd7aa3]{width:48px!important;height:48px!important;border-radius:14px!important;background:linear-gradient(135deg,#6366f1,#a855f7)!important;display:flex!important;align-items:center!important;justify-content:center!important;margin-bottom:4px!important;box-shadow:0 4px 15px #6366f14d!important}.javm-about-logo svg[data-v-7ccd7aa3]{width:24px!important;height:24px!important;color:#fff!important}.javm-about-name[data-v-7ccd7aa3]{font-size:16px!important;font-weight:700!important;color:#f1f5f9!important;letter-spacing:-.02em!important}.javm-about-ver[data-v-7ccd7aa3]{font-size:11px!important;color:#64748b!important;background:#6366f11a!important;padding:2px 10px!important;border-radius:10px!important;font-weight:500!important}.javm-about-desc[data-v-7ccd7aa3]{font-size:12px!important;color:#94a3b8!important;text-align:center!important;margin:4px 0 12px!important;line-height:1.5!important}.javm-about-links[data-v-7ccd7aa3]{display:flex!important;flex-direction:column!important;gap:8px!important;width:100%!important}.javm-about-link[data-v-7ccd7aa3]{all:unset;display:flex!important;align-items:center!important;gap:12px!important;padding:12px 14px!important;border-radius:10px!important;background:#ffffff0a!important;border:1px solid rgba(255,255,255,.06)!important;cursor:pointer!important;color:#94a3b8!important;transition:all .2s ease!important;text-decoration:none!important}.javm-about-link[data-v-7ccd7aa3]:hover{background:#6366f114!important;border-color:#6366f133!important;transform:translateY(-1px)!important}.javm-about-link-text[data-v-7ccd7aa3]{flex:1!important;display:flex!important;flex-direction:column!important;gap:2px!important;min-width:0!important}.javm-about-link-title[data-v-7ccd7aa3]{font-size:13px!important;font-weight:600!important;color:#e2e8f0!important}.javm-about-link-sub[data-v-7ccd7aa3]{font-size:11px!important;color:#64748b!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}.javm-toast[data-v-7ccd7aa3]{position:absolute!important;bottom:12px!important;left:50%!important;transform:translate(-50%)!important;background:#0f172ae6!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;border:1px solid rgba(99,102,241,.15)!important;color:#e2e8f0!important;font-size:12px!important;font-weight:500!important;padding:6px 14px!important;border-radius:10px!important;pointer-events:none!important;white-space:nowrap!important;display:flex!important;align-items:center!important;gap:6px!important;box-shadow:0 4px 15px #0000004d!important}.bubble-enter-active[data-v-7ccd7aa3]{transition:opacity .4s ease,transform .5s cubic-bezier(.34,1.56,.64,1)!important}.bubble-leave-active[data-v-7ccd7aa3]{transition:opacity .25s ease,transform .25s ease!important}.bubble-enter-from[data-v-7ccd7aa3]{opacity:0!important;transform:scale(.3) rotate(-30deg)!important}.bubble-leave-to[data-v-7ccd7aa3]{opacity:0!important;transform:scale(.5)!important}.panel-enter-active[data-v-7ccd7aa3]{transition:opacity .3s ease,transform .4s cubic-bezier(.34,1.56,.64,1)!important}.panel-leave-active[data-v-7ccd7aa3]{transition:opacity .2s ease,transform .2s ease!important}.panel-enter-from[data-v-7ccd7aa3]{opacity:0!important;transform:translateY(20px) scale(.95)!important}.panel-leave-to[data-v-7ccd7aa3]{opacity:0!important;transform:translateY(10px) scale(.98)!important}.title-swap-enter-active[data-v-7ccd7aa3],.title-swap-leave-active[data-v-7ccd7aa3]{transition:opacity .15s ease,transform .15s ease!important}.title-swap-enter-from[data-v-7ccd7aa3]{opacity:0!important;transform:translateY(-6px)!important}.title-swap-leave-to[data-v-7ccd7aa3]{opacity:0!important;transform:translateY(6px)!important}.view-swap-enter-active[data-v-7ccd7aa3]{transition:opacity .2s ease .05s,transform .25s ease!important}.view-swap-leave-active[data-v-7ccd7aa3]{transition:opacity .15s ease,transform .15s ease!important}.view-swap-enter-from[data-v-7ccd7aa3]{opacity:0!important;transform:translate(12px)!important}.view-swap-leave-to[data-v-7ccd7aa3]{opacity:0!important;transform:translate(-12px)!important}.list-item-enter-active[data-v-7ccd7aa3]{transition:opacity .3s ease,transform .3s cubic-bezier(.34,1.56,.64,1)!important;transition-delay:calc(var(--i, 0) * .04s)!important}.list-item-leave-active[data-v-7ccd7aa3]{transition:opacity .2s ease,transform .2s ease!important}.list-item-enter-from[data-v-7ccd7aa3]{opacity:0!important;transform:translate(16px)!important}.list-item-leave-to[data-v-7ccd7aa3]{opacity:0!important;transform:translate(-16px) scale(.95)!important}.list-item-move[data-v-7ccd7aa3]{transition:transform .3s ease!important}.toast-enter-active[data-v-7ccd7aa3]{transition:opacity .25s ease,transform .3s cubic-bezier(.34,1.56,.64,1)!important}.toast-leave-active[data-v-7ccd7aa3]{transition:opacity .2s ease,transform .2s ease!important}.toast-enter-from[data-v-7ccd7aa3]{opacity:0!important;transform:translate(-50%) translateY(8px) scale(.9)!important}.toast-leave-to[data-v-7ccd7aa3]{opacity:0!important;transform:translate(-50%) translateY(-4px)!important} ');

  const STORAGE_KEY = "javm-players";
  function storageGet(key) {
    try {
      if (typeof GM_getValue === "function") {
        const v = GM_getValue(key, "");
        if (v) return typeof v === "string" ? v : JSON.stringify(v);
      }
    } catch {
    }
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
    }
    return "";
  }
  function storageSet(key, value) {
    try {
      if (typeof GM_setValue === "function") GM_setValue(key, value);
    } catch {
    }
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  }
  const DEFAULT_PLAYERS = [
    { id: "potplayer", name: "PotPlayer", icon: "🎬", template: "potplayer://{url}", enabled: true, builtin: true },
    { id: "vlc", name: "VLC", icon: "📡", template: "vlc://{encoded_url}", enabled: true, builtin: true },
    { id: "mpc-hc", name: "MPC-HC", icon: "🖥", template: "mpc-hc://open/file?url={encoded_url}", enabled: true, builtin: true },
    { id: "mpv", name: "MPV", icon: "🎵", template: "mpv://play/?url={encoded_url}", enabled: true, builtin: true }
  ];
  function formatPlayerUrl(template, rawUrl) {
    return template.replace(/\{url\}/g, rawUrl).replace(/\{encoded_url\}/g, encodeURIComponent(rawUrl));
  }
  function loadPlayers() {
    try {
      const raw = storageGet(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_PLAYERS);
      const saved = JSON.parse(raw);
      const map = new Map(saved.map((p) => [p.id, p]));
      for (const def of DEFAULT_PLAYERS) {
        if (!map.has(def.id)) {
          saved.push({ ...def });
        }
      }
      return saved;
    } catch {
      return structuredClone(DEFAULT_PLAYERS);
    }
  }
  function savePlayers(players) {
    storageSet(STORAGE_KEY, JSON.stringify(players));
  }
  const POS_KEY = "javm-bubble-pos";
  const REMEMBER_KEY = "javm-remember-pos";
  function loadRememberPosition() {
    const v = storageGet(REMEMBER_KEY);
    return v === "true";
  }
  function saveRememberPosition(val) {
    storageSet(REMEMBER_KEY, val ? "true" : "false");
  }
  function loadBubblePosition() {
    try {
      const raw = storageGet(POS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  function saveBubblePosition(pos) {
    storageSet(POS_KEY, JSON.stringify(pos));
  }
  const _hoisted_1 = {
    key: 0,
    class: "javm-bubble-wrap"
  };
  const _hoisted_2 = ["title"];
  const _hoisted_3 = { class: "javm-bubble-num" };
  const _hoisted_4 = { class: "javm-panel-header" };
  const _hoisted_5 = { class: "javm-panel-title-area" };
  const _hoisted_6 = {
    key: "list",
    class: "javm-panel-title"
  };
  const _hoisted_7 = {
    key: "settings",
    class: "javm-panel-title"
  };
  const _hoisted_8 = {
    key: "about",
    class: "javm-panel-title"
  };
  const _hoisted_9 = {
    key: 0,
    class: "javm-panel-count"
  };
  const _hoisted_10 = { class: "javm-header-actions" };
  const _hoisted_11 = {
    key: "list",
    class: "javm-panel-body"
  };
  const _hoisted_12 = { class: "javm-item-info" };
  const _hoisted_13 = { class: "javm-badge" };
  const _hoisted_14 = ["title"];
  const _hoisted_15 = { class: "javm-actions" };
  const _hoisted_16 = ["onClick"];
  const _hoisted_17 = ["onClick"];
  const _hoisted_18 = ["onClick", "title"];
  const _hoisted_19 = {
    key: "settings",
    class: "javm-panel-body javm-settings"
  };
  const _hoisted_20 = { class: "javm-settings-section" };
  const _hoisted_21 = { class: "javm-switch" };
  const _hoisted_22 = ["checked", "onChange"];
  const _hoisted_23 = { class: "javm-setting-icon" };
  const _hoisted_24 = { class: "javm-setting-name" };
  const _hoisted_25 = { class: "javm-setting-tpl" };
  const _hoisted_26 = ["onClick"];
  const _hoisted_27 = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { "width": "12px", "height": "12px" }
  };
  const _hoisted_28 = {
    key: 1,
    class: "javm-setting-tag"
  };
  const _hoisted_29 = { class: "javm-settings-section" };
  const _hoisted_30 = { class: "javm-setting-row" };
  const _hoisted_31 = { class: "javm-switch" };
  const _hoisted_32 = ["checked"];
  const _hoisted_33 = { class: "javm-settings-section" };
  const _hoisted_34 = { class: "javm-add-form" };
  const _hoisted_35 = {
    key: "about",
    class: "javm-panel-body javm-about"
  };
  const _hoisted_36 = { class: "javm-about-ver" };
  const _hoisted_37 = { class: "javm-about-links" };
  const _hoisted_38 = {
    class: "javm-about-link",
    href: "https://github.com/ddmoyu/javm",
    target: "_blank",
    rel: "noopener noreferrer"
  };
  const _hoisted_39 = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { "width": "16px", "height": "16px", "flex-shrink": "0" }
  };
  const _hoisted_40 = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { "width": "14px", "height": "14px", "flex-shrink": "0", "opacity": "0.4" }
  };
  const _hoisted_41 = {
    class: "javm-about-link",
    href: "https://github.com/ddmoyu/javm_us",
    target: "_blank",
    rel: "noopener noreferrer"
  };
  const _hoisted_42 = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { "width": "16px", "height": "16px", "flex-shrink": "0" }
  };
  const _hoisted_43 = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { "width": "14px", "height": "14px", "flex-shrink": "0", "opacity": "0.4" }
  };
  const _hoisted_44 = {
    key: 0,
    class: "javm-toast"
  };
  const _hoisted_45 = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: { "width": "14px", "height": "14px", "flex-shrink": "0" }
  };
  const _sfc_main = vue.defineComponent({
    __name: "App",
    setup(__props) {
      const collector2 = vue.inject("collector");
      const version = typeof GM_info !== "undefined" ? GM_info.script.version : "1.0.1";
      const items = vue.ref([]);
      const showPanel = vue.ref(false);
      const showSettings = vue.ref(false);
      const showAbout = vue.ref(false);
      const toastMsg = vue.ref("");
      const bubblePressed = vue.ref(false);
      let toastTimer = 0;
      let offChange = null;
      const players = vue.ref(loadPlayers());
      const enabledPlayers = vue.computed(() => players.value.filter((p) => p.enabled));
      const newPlayer = vue.ref({ name: "", icon: "🔗", template: "" });
      const rememberPos = vue.ref(loadRememberPosition());
      const bubblePos = vue.ref(loadBubblePosition() ?? { bottom: 24, right: 24 });
      const windowWidth = vue.ref(typeof window !== "undefined" ? window.innerWidth : 1920);
      const isDragging = vue.ref(false);
      let dragStartX = 0;
      let dragStartY = 0;
      let dragStartRight = 0;
      let dragStartBottom = 0;
      let hasMoved = false;
      function onBubblePointerDown(e) {
        bubblePressed.value = true;
        isDragging.value = false;
        hasMoved = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartRight = bubblePos.value.right;
        dragStartBottom = bubblePos.value.bottom;
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
      }
      function onPointerMove(e) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (!hasMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        hasMoved = true;
        isDragging.value = true;
        const maxRight = window.innerWidth - 56;
        const maxBottom = window.innerHeight - 56;
        bubblePos.value = {
          right: Math.max(0, Math.min(maxRight, dragStartRight - dx)),
          bottom: Math.max(0, Math.min(maxBottom, dragStartBottom - dy))
        };
      }
      function onPointerUp() {
        bubblePressed.value = false;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        if (isDragging.value && rememberPos.value) {
          saveBubblePosition(bubblePos.value);
        }
        setTimeout(() => {
          isDragging.value = false;
        }, 0);
      }
      function onBubbleClick() {
        if (hasMoved) return;
        togglePanel();
      }
      const panelStyle = vue.computed(() => {
        const panelWidth = 500;
        const margin = 8;
        const panelLeftEdge = windowWidth.value - bubblePos.value.right - panelWidth;
        if (panelLeftEdge < margin) {
          const offset = margin - panelLeftEdge;
          return { transform: `translateX(${offset}px)` };
        }
        return {};
      });
      function toggleRememberPos() {
        rememberPos.value = !rememberPos.value;
        saveRememberPosition(rememberPos.value);
        if (rememberPos.value) {
          saveBubblePosition(bubblePos.value);
        }
      }
      function resetPosition() {
        bubblePos.value = { bottom: 24, right: 24 };
        if (rememberPos.value) {
          saveBubblePosition(bubblePos.value);
        }
        toast("已重置位置");
      }
      function onWindowResize() {
        windowWidth.value = window.innerWidth;
      }
      vue.onMounted(() => {
        items.value = collector2.getItems();
        offChange = collector2.onChange(() => {
          items.value = collector2.getItems();
        });
        window.addEventListener("resize", onWindowResize);
      });
      vue.onUnmounted(() => {
        offChange?.();
        window.removeEventListener("resize", onWindowResize);
      });
      function togglePanel() {
        showPanel.value = !showPanel.value;
        showSettings.value = false;
        showAbout.value = false;
      }
      function toast(msg) {
        toastMsg.value = msg;
        clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toastMsg.value = "", 2e3);
      }
      function copyUrl(url) {
        GM_setClipboard(url);
        toast("已复制链接");
      }
      const downloadedUrls = new Set();
      function getPageTitle() {
        try {
          if (window.top && window.top.document) {
            return window.top.document.title;
          }
        } catch {
        }
        try {
          const topTitle = GM_getValue("javm_top_title", "");
          if (topTitle) return topTitle;
        } catch {
        }
        return document.title;
      }
      function downloadJavm(item, index) {
        if (downloadedUrls.has(item.url)) {
          toast("该任务已发送，请勿重复下载");
          return;
        }
        let title = getPageTitle() || item.filename;
        if (items.value.length > 1) {
          title += `_${index + 1}`;
        }
        const deeplink = `javm://download?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(title)}`;
        downloadedUrls.add(item.url);
        GM_openInTab(deeplink, { active: false });
        toast("已发送到 JAVM");
      }
      function launchPlayer(player, url) {
        const href = formatPlayerUrl(player.template, url);
        const a = document.createElement("a");
        a.href = href;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast(`已调用 ${player.name}`);
      }
      function togglePlayer(id) {
        const p = players.value.find((x) => x.id === id);
        if (p) {
          p.enabled = !p.enabled;
          savePlayers(players.value);
        }
      }
      function removePlayer(id) {
        players.value = players.value.filter((x) => x.id !== id);
        savePlayers(players.value);
      }
      function addPlayer() {
        const { name, icon, template } = newPlayer.value;
        if (!name.trim() || !template.trim()) {
          toast("名称和协议模板不能为空");
          return;
        }
        const id = `custom-${Date.now()}`;
        players.value.push({ id, name: name.trim(), icon: icon.trim() || "🔗", template: template.trim(), enabled: true, builtin: false });
        savePlayers(players.value);
        newPlayer.value = { name: "", icon: "🔗", template: "" };
        toast(`已添加 ${name}`);
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          class: "javm-root",
          style: vue.normalizeStyle({ bottom: bubblePos.value.bottom + "px", right: bubblePos.value.right + "px" })
        }, [
          vue.createVNode(vue.Transition, { name: "bubble" }, {
            default: vue.withCtx(() => [
              items.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
                _cache[7] || (_cache[7] = vue.createElementVNode("div", { class: "javm-bubble-ring" }, null, -1)),
                vue.createElementVNode("button", {
                  class: vue.normalizeClass(["javm-bubble", { active: showPanel.value, pressed: bubblePressed.value, dragging: isDragging.value }]),
                  onClick: onBubbleClick,
                  onPointerdown: onBubblePointerDown,
                  title: `发现 ${items.value.length} 个 m3u8 流`
                }, [
                  _cache[6] || (_cache[6] = vue.createElementVNode("svg", {
                    class: "javm-bubble-icon",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round"
                  }, [
                    vue.createElementVNode("polygon", { points: "23 7 16 12 23 17 23 7" }),
                    vue.createElementVNode("rect", {
                      x: "1",
                      y: "5",
                      width: "15",
                      height: "14",
                      rx: "2",
                      ry: "2"
                    })
                  ], -1)),
                  vue.createElementVNode("span", _hoisted_3, vue.toDisplayString(items.value.length), 1)
                ], 42, _hoisted_2)
              ])) : vue.createCommentVNode("", true)
            ]),
            _: 1
          }),
          vue.createVNode(vue.Transition, { name: "panel" }, {
            default: vue.withCtx(() => [
              showPanel.value && items.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 0,
                class: "javm-panel",
                style: vue.normalizeStyle(panelStyle.value)
              }, [
                _cache[33] || (_cache[33] = vue.createElementVNode("div", { class: "javm-panel-glow" }, null, -1)),
                vue.createElementVNode("div", _hoisted_4, [
                  vue.createElementVNode("div", _hoisted_5, [
                    vue.createVNode(vue.Transition, {
                      name: "title-swap",
                      mode: "out-in"
                    }, {
                      default: vue.withCtx(() => [
                        !showSettings.value && !showAbout.value ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_6, "M3U8 流")) : showSettings.value ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_7, "播放器设置")) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_8, "关于"))
                      ]),
                      _: 1
                    }),
                    !showSettings.value && !showAbout.value ? (vue.openBlock(), vue.createElementBlock("span", _hoisted_9, vue.toDisplayString(items.value.length), 1)) : vue.createCommentVNode("", true)
                  ]),
                  vue.createElementVNode("div", _hoisted_10, [
                    vue.createElementVNode("button", {
                      class: vue.normalizeClass(["javm-icon-btn", { "is-active": showSettings.value }]),
                      onClick: _cache[0] || (_cache[0] = ($event) => {
                        showSettings.value = !showSettings.value;
                        showAbout.value = false;
                      }),
                      title: "设置"
                    }, [..._cache[8] || (_cache[8] = [
                      vue.createElementVNode("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      }, [
                        vue.createElementVNode("circle", {
                          cx: "12",
                          cy: "12",
                          r: "3"
                        }),
                        vue.createElementVNode("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })
                      ], -1)
                    ])], 2),
                    vue.createElementVNode("button", {
                      class: vue.normalizeClass(["javm-icon-btn", { "is-active": showAbout.value }]),
                      onClick: _cache[1] || (_cache[1] = ($event) => {
                        showAbout.value = !showAbout.value;
                        showSettings.value = false;
                      }),
                      title: "关于"
                    }, [..._cache[9] || (_cache[9] = [
                      vue.createElementVNode("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      }, [
                        vue.createElementVNode("circle", {
                          cx: "12",
                          cy: "12",
                          r: "10"
                        }),
                        vue.createElementVNode("line", {
                          x1: "12",
                          y1: "16",
                          x2: "12",
                          y2: "12"
                        }),
                        vue.createElementVNode("line", {
                          x1: "12",
                          y1: "8",
                          x2: "12.01",
                          y2: "8"
                        })
                      ], -1)
                    ])], 2),
                    vue.createElementVNode("button", {
                      class: "javm-icon-btn javm-close-btn",
                      onClick: _cache[2] || (_cache[2] = ($event) => showPanel.value = false),
                      title: "关闭"
                    }, [..._cache[10] || (_cache[10] = [
                      vue.createElementVNode("svg", {
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": "2",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      }, [
                        vue.createElementVNode("line", {
                          x1: "18",
                          y1: "6",
                          x2: "6",
                          y2: "18"
                        }),
                        vue.createElementVNode("line", {
                          x1: "6",
                          y1: "6",
                          x2: "18",
                          y2: "18"
                        })
                      ], -1)
                    ])])
                  ])
                ]),
                vue.createVNode(vue.Transition, {
                  name: "view-swap",
                  mode: "out-in"
                }, {
                  default: vue.withCtx(() => [
                    !showSettings.value && !showAbout.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_11, [
                      vue.createVNode(vue.TransitionGroup, {
                        name: "list-item",
                        tag: "div"
                      }, {
                        default: vue.withCtx(() => [
                          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(items.value, (item, i) => {
                            return vue.openBlock(), vue.createElementBlock("div", {
                              key: item.url,
                              class: "javm-item",
                              style: vue.normalizeStyle({ "--i": i })
                            }, [
                              vue.createElementVNode("div", _hoisted_12, [
                                vue.createElementVNode("span", _hoisted_13, vue.toDisplayString(item.resolution), 1),
                                vue.createElementVNode("span", {
                                  class: "javm-filename",
                                  title: item.url
                                }, vue.toDisplayString(item.filename), 9, _hoisted_14)
                              ]),
                              vue.createElementVNode("div", _hoisted_15, [
                                vue.createElementVNode("button", {
                                  class: "javm-act-btn javm-act-copy",
                                  onClick: ($event) => copyUrl(item.url),
                                  title: "复制链接"
                                }, [..._cache[11] || (_cache[11] = [
                                  vue.createElementVNode("svg", {
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    "stroke-width": "2",
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round"
                                  }, [
                                    vue.createElementVNode("rect", {
                                      x: "9",
                                      y: "9",
                                      width: "13",
                                      height: "13",
                                      rx: "2",
                                      ry: "2"
                                    }),
                                    vue.createElementVNode("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
                                  ], -1)
                                ])], 8, _hoisted_16),
                                vue.createElementVNode("button", {
                                  class: "javm-act-btn javm-act-dl",
                                  onClick: ($event) => downloadJavm(item, i),
                                  title: "JAVM 下载"
                                }, [..._cache[12] || (_cache[12] = [
                                  vue.createElementVNode("svg", {
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    "stroke-width": "2",
                                    "stroke-linecap": "round",
                                    "stroke-linejoin": "round"
                                  }, [
                                    vue.createElementVNode("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                                    vue.createElementVNode("polyline", { points: "7 10 12 15 17 10" }),
                                    vue.createElementVNode("line", {
                                      x1: "12",
                                      y1: "15",
                                      x2: "12",
                                      y2: "3"
                                    })
                                  ], -1)
                                ])], 8, _hoisted_17),
                                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(enabledPlayers.value, (p) => {
                                  return vue.openBlock(), vue.createElementBlock("button", {
                                    key: p.id,
                                    class: "javm-act-btn javm-act-player",
                                    onClick: ($event) => launchPlayer(p, item.url),
                                    title: p.name
                                  }, vue.toDisplayString(p.icon), 9, _hoisted_18);
                                }), 128))
                              ])
                            ], 4);
                          }), 128))
                        ]),
                        _: 1
                      })
                    ])) : showSettings.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_19, [
                      vue.createElementVNode("div", _hoisted_20, [
                        _cache[15] || (_cache[15] = vue.createElementVNode("div", { class: "javm-settings-label" }, "播放器列表", -1)),
                        vue.createVNode(vue.TransitionGroup, {
                          name: "list-item",
                          tag: "div"
                        }, {
                          default: vue.withCtx(() => [
                            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(players.value, (p, i) => {
                              return vue.openBlock(), vue.createElementBlock("div", {
                                key: p.id,
                                class: "javm-setting-row",
                                style: vue.normalizeStyle({ "--i": i })
                              }, [
                                vue.createElementVNode("label", _hoisted_21, [
                                  vue.createElementVNode("input", {
                                    type: "checkbox",
                                    checked: p.enabled,
                                    onChange: ($event) => togglePlayer(p.id)
                                  }, null, 40, _hoisted_22),
                                  _cache[13] || (_cache[13] = vue.createElementVNode("span", { class: "javm-slider" }, null, -1))
                                ]),
                                vue.createElementVNode("span", _hoisted_23, vue.toDisplayString(p.icon), 1),
                                vue.createElementVNode("span", _hoisted_24, vue.toDisplayString(p.name), 1),
                                vue.createElementVNode("span", _hoisted_25, vue.toDisplayString(p.template), 1),
                                !p.builtin ? (vue.openBlock(), vue.createElementBlock("button", {
                                  key: 0,
                                  class: "javm-setting-del",
                                  onClick: ($event) => removePlayer(p.id),
                                  title: "删除"
                                }, [
                                  (vue.openBlock(), vue.createElementBlock("svg", _hoisted_27, [..._cache[14] || (_cache[14] = [
                                    vue.createElementVNode("line", {
                                      x1: "18",
                                      y1: "6",
                                      x2: "6",
                                      y2: "18"
                                    }, null, -1),
                                    vue.createElementVNode("line", {
                                      x1: "6",
                                      y1: "6",
                                      x2: "18",
                                      y2: "18"
                                    }, null, -1)
                                  ])]))
                                ], 8, _hoisted_26)) : (vue.openBlock(), vue.createElementBlock("span", _hoisted_28, "内置"))
                              ], 4);
                            }), 128))
                          ]),
                          _: 1
                        })
                      ]),
                      vue.createElementVNode("div", _hoisted_29, [
                        _cache[18] || (_cache[18] = vue.createElementVNode("div", { class: "javm-settings-label" }, "气泡位置", -1)),
                        vue.createElementVNode("div", _hoisted_30, [
                          vue.createElementVNode("label", _hoisted_31, [
                            vue.createElementVNode("input", {
                              type: "checkbox",
                              checked: rememberPos.value,
                              onChange: toggleRememberPos
                            }, null, 40, _hoisted_32),
                            _cache[16] || (_cache[16] = vue.createElementVNode("span", { class: "javm-slider" }, null, -1))
                          ]),
                          _cache[17] || (_cache[17] = vue.createElementVNode("span", {
                            class: "javm-setting-name",
                            style: { "flex": "1" }
                          }, "记住位置", -1)),
                          vue.createElementVNode("button", {
                            class: "javm-reset-btn",
                            onClick: resetPosition,
                            title: "重置到右下角"
                          }, "重置")
                        ]),
                        _cache[19] || (_cache[19] = vue.createElementVNode("div", { class: "javm-hint" }, "拖拽气泡按钮可自由移动位置", -1))
                      ]),
                      vue.createElementVNode("div", _hoisted_33, [
                        _cache[21] || (_cache[21] = vue.createElementVNode("div", { class: "javm-settings-label" }, "添加自定义播放器", -1)),
                        vue.createElementVNode("div", _hoisted_34, [
                          vue.withDirectives(vue.createElementVNode("input", {
                            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => newPlayer.value.icon = $event),
                            class: "javm-input javm-input-icon",
                            placeholder: "📦",
                            maxlength: "2"
                          }, null, 512), [
                            [vue.vModelText, newPlayer.value.icon]
                          ]),
                          vue.withDirectives(vue.createElementVNode("input", {
                            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => newPlayer.value.name = $event),
                            class: "javm-input javm-input-name",
                            placeholder: "名称"
                          }, null, 512), [
                            [vue.vModelText, newPlayer.value.name]
                          ]),
                          vue.withDirectives(vue.createElementVNode("input", {
                            "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => newPlayer.value.template = $event),
                            class: "javm-input javm-input-tpl",
                            placeholder: "proto://{url}"
                          }, null, 512), [
                            [vue.vModelText, newPlayer.value.template]
                          ]),
                          vue.createElementVNode("button", {
                            class: "javm-add-btn",
                            onClick: addPlayer
                          }, [..._cache[20] || (_cache[20] = [
                            vue.createElementVNode("svg", {
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "2.5",
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round"
                            }, [
                              vue.createElementVNode("line", {
                                x1: "12",
                                y1: "5",
                                x2: "12",
                                y2: "19"
                              }),
                              vue.createElementVNode("line", {
                                x1: "5",
                                y1: "12",
                                x2: "19",
                                y2: "12"
                              })
                            ], -1)
                          ])])
                        ]),
                        _cache[22] || (_cache[22] = vue.createElementVNode("div", { class: "javm-hint" }, [
                          vue.createTextVNode(" 模板变量: "),
                          vue.createElementVNode("code", null, "{url}"),
                          vue.createTextVNode(" 原始链接 · "),
                          vue.createElementVNode("code", null, "{encoded_url}"),
                          vue.createTextVNode(" 编码后链接 ")
                        ], -1))
                      ])
                    ])) : (vue.openBlock(), vue.createElementBlock("div", _hoisted_35, [
                      _cache[29] || (_cache[29] = vue.createElementVNode("div", { class: "javm-about-logo" }, [
                        vue.createElementVNode("svg", {
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          "stroke-width": "1.5",
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round"
                        }, [
                          vue.createElementVNode("polygon", { points: "23 7 16 12 23 17 23 7" }),
                          vue.createElementVNode("rect", {
                            x: "1",
                            y: "5",
                            width: "15",
                            height: "14",
                            rx: "2",
                            ry: "2"
                          })
                        ])
                      ], -1)),
                      _cache[30] || (_cache[30] = vue.createElementVNode("div", { class: "javm-about-name" }, "JAVM M3U8 Helper", -1)),
                      vue.createElementVNode("div", _hoisted_36, "v" + vue.toDisplayString(vue.unref(version)), 1),
                      _cache[31] || (_cache[31] = vue.createElementVNode("div", { class: "javm-about-desc" }, "自动检测页面中的 m3u8 视频流，一键下载或播放。", -1)),
                      vue.createElementVNode("div", _hoisted_37, [
                        vue.createElementVNode("a", _hoisted_38, [
                          (vue.openBlock(), vue.createElementBlock("svg", _hoisted_39, [..._cache[23] || (_cache[23] = [
                            vue.createElementVNode("path", { d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" }, null, -1)
                          ])])),
                          _cache[25] || (_cache[25] = vue.createElementVNode("div", { class: "javm-about-link-text" }, [
                            vue.createElementVNode("span", { class: "javm-about-link-title" }, "JAVM"),
                            vue.createElementVNode("span", { class: "javm-about-link-sub" }, "Jav 视频管理工具，包含：刮削，下载，播放")
                          ], -1)),
                          (vue.openBlock(), vue.createElementBlock("svg", _hoisted_40, [..._cache[24] || (_cache[24] = [
                            vue.createElementVNode("line", {
                              x1: "7",
                              y1: "17",
                              x2: "17",
                              y2: "7"
                            }, null, -1),
                            vue.createElementVNode("polyline", { points: "7 7 17 7 17 17" }, null, -1)
                          ])]))
                        ]),
                        vue.createElementVNode("a", _hoisted_41, [
                          (vue.openBlock(), vue.createElementBlock("svg", _hoisted_42, [..._cache[26] || (_cache[26] = [
                            vue.createElementVNode("path", { d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" }, null, -1)
                          ])])),
                          _cache[28] || (_cache[28] = vue.createElementVNode("div", { class: "javm-about-link-text" }, [
                            vue.createElementVNode("span", { class: "javm-about-link-title" }, "JAVM UserScript"),
                            vue.createElementVNode("span", { class: "javm-about-link-sub" }, "M3U8 检测油猴脚本，配合 JAVM 使用")
                          ], -1)),
                          (vue.openBlock(), vue.createElementBlock("svg", _hoisted_43, [..._cache[27] || (_cache[27] = [
                            vue.createElementVNode("line", {
                              x1: "7",
                              y1: "17",
                              x2: "17",
                              y2: "7"
                            }, null, -1),
                            vue.createElementVNode("polyline", { points: "7 7 17 7 17 17" }, null, -1)
                          ])]))
                        ])
                      ])
                    ]))
                  ]),
                  _: 1
                }),
                vue.createVNode(vue.Transition, { name: "toast" }, {
                  default: vue.withCtx(() => [
                    toastMsg.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_44, [
                      (vue.openBlock(), vue.createElementBlock("svg", _hoisted_45, [..._cache[32] || (_cache[32] = [
                        vue.createElementVNode("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }, null, -1),
                        vue.createElementVNode("polyline", { points: "22 4 12 14.01 9 11.01" }, null, -1)
                      ])])),
                      vue.createTextVNode(" " + vue.toDisplayString(toastMsg.value), 1)
                    ])) : vue.createCommentVNode("", true)
                  ]),
                  _: 1
                })
              ], 4)) : vue.createCommentVNode("", true)
            ]),
            _: 1
          })
        ], 4);
      };
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const App = _export_sfc(_sfc_main, [["__scopeId", "data-v-7ccd7aa3"]]);
  function checkUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.pathname.endsWith(".m3u8") || u.pathname.endsWith(".m3u");
    } catch {
      return /\.m3u8?(?:[?#]|$)/i.test(url);
    }
  }
  function checkContent(content) {
    return content.trim().startsWith("#EXTM3U");
  }
  function guessResolution(url, index) {
    const m = url.match(/[_\-/](\d{3,4})[pP]|(\d{3,4})x\d{3,4}|[_\-](hd|sd|fhd|uhd|4k|2k|1080|720|480|360)[_\-/]/i);
    if (m) {
      if (m[1]) return `${m[1]}p`;
      if (m[2]) return `${m[2]}p`;
      if (m[3]) return m[3].toUpperCase();
    }
    return `流 ${index + 1}`;
  }
  function urlToFilename(url) {
    try {
      const path = new URL(url).pathname;
      return decodeURIComponent(path.split("/").pop() ?? url);
    } catch {
      return url;
    }
  }
  function buildItems(urls) {
    return urls.map((url, i) => ({
      url,
      resolution: guessResolution(url, i),
      filename: urlToFilename(url)
    }));
  }
  function scanVideoElements() {
    const urls = [];
    document.querySelectorAll("video, source, video source").forEach((el) => {
      const src = el.src || el.getAttribute("src") || "";
      if (checkUrl(src)) urls.push(src);
      const dataSrc = el.getAttribute("data-src") || "";
      if (checkUrl(dataSrc)) urls.push(dataSrc);
    });
    return urls;
  }
  function hookNetwork(onFound) {
    const w = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const origResponseText = w.Response.prototype.text;
    w.Response.prototype.text = function() {
      return new Promise((resolve, reject) => {
        origResponseText.call(this).then((text) => {
          resolve(text);
          if (checkContent(text)) {
            onFound(this.url);
          }
        }).catch(reject);
      });
    };
    const origOpen = w.XMLHttpRequest.prototype.open;
    w.XMLHttpRequest.prototype.open = function(...args) {
      this.addEventListener("load", () => {
        try {
          const content = this.responseText;
          if (checkContent(content)) {
            onFound(args[1]);
          }
        } catch {
        }
        try {
          const reqUrl = String(args[1]);
          if (checkUrl(reqUrl)) {
            onFound(reqUrl);
          }
        } catch {
        }
      });
      return origOpen.apply(this, args);
    };
  }
  function createCollector() {
    const found = new Set();
    const listeners = new Set();
    function notify() {
      for (const fn of listeners) fn();
    }
    function add(url) {
      const clean = url.trim();
      if (!clean || found.has(clean)) return;
      try {
        const full = new URL(clean, location.href).href;
        if (found.has(full)) return;
        found.add(full);
      } catch {
        if (found.has(clean)) return;
        found.add(clean);
      }
      notify();
    }
    function onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
    function getItems() {
      return buildItems([...found]);
    }
    hookNetwork(add);
    let scanTimer = 0;
    function debouncedScan() {
      if (scanTimer) return;
      scanTimer = window.setTimeout(() => {
        scanTimer = 0;
        scanVideoElements().forEach(add);
      }, 300);
    }
    setInterval(debouncedScan, 3e3);
    const observer = new MutationObserver(debouncedScan);
    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      const waitDOM = setInterval(() => {
        if (document.documentElement) {
          clearInterval(waitDOM);
          observer.observe(document.documentElement, { childList: true, subtree: true });
        }
      }, 50);
    }
    return { add, onChange, getItems };
  }
  function isTopFrame() {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
  }
  if (isTopFrame()) {
    const storeTitle = () => {
      if (document.title) {
        GM_setValue("javm_top_title", document.title);
        GM_setValue("javm_top_origin", location.origin);
      }
    };
    document.addEventListener("DOMContentLoaded", storeTitle);
    window.addEventListener("load", storeTitle);
    const obs = new MutationObserver(storeTitle);
    const tryObserve = () => {
      const titleEl = document.querySelector("title");
      if (titleEl) {
        obs.observe(titleEl, { childList: true, characterData: true, subtree: true });
      } else if (document.head) {
        obs.observe(document.head, { childList: true, subtree: true });
      }
    };
    if (document.head) tryObserve();
    else document.addEventListener("DOMContentLoaded", tryObserve);
  }
  const collector = createCollector();
  function mountUI() {
    const host = document.createElement("div");
    host.id = "javm-us-host";
    document.documentElement.appendChild(host);
    const app = vue.createApp(App);
    app.provide("collector", collector);
    app.mount(host);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountUI);
  } else {
    mountUI();
  }

})(Vue);
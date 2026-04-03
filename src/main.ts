import { createApp } from 'vue';
import App from './App.vue';
import { createCollector } from './collector';

// 顶层窗口存储标题，供 iframe 内的脚本实例读取
function isTopFrame(): boolean {
  try { return window.self === window.top } catch { return false }
}

if (isTopFrame()) {
  const storeTitle = () => {
    if (document.title) {
      GM_setValue('javm_top_title', document.title)
      GM_setValue('javm_top_origin', location.origin)
    }
  }
  document.addEventListener('DOMContentLoaded', storeTitle)
  window.addEventListener('load', storeTitle)
  // 监听 title 变化（SPA 等场景）
  const obs = new MutationObserver(storeTitle)
  const tryObserve = () => {
    const titleEl = document.querySelector('title')
    if (titleEl) {
      obs.observe(titleEl, { childList: true, characterData: true, subtree: true })
    } else if (document.head) {
      obs.observe(document.head, { childList: true, subtree: true })
    }
  }
  if (document.head) tryObserve()
  else document.addEventListener('DOMContentLoaded', tryObserve)
}

// 尽早 hook 网络请求（document-start）
const collector = createCollector();

// 等 DOM 就绪后再挂载 UI
function mountUI() {
  const host = document.createElement('div');
  host.id = 'javm-us-host';
  document.documentElement.appendChild(host);
  const app = createApp(App);
  app.provide('collector', collector);
  app.mount(host);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountUI);
} else {
  mountUI();
}

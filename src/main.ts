import { createApp } from 'vue';
import App from './App.vue';
import { createCollector } from './collector';

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

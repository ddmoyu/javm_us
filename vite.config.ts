import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://raw.githubusercontent.com/BidBadEgg/javm/main/src-tauri/icons/32x32.png',
        namespace: 'bidbadegg/javm-m3u8-helper',
        name: 'JAVM M3U8 Helper',
        version: '1.0.0',
        description: '检测页面中的 m3u8 链接，一键唤起 JAVM 下载或调用播放器',
        author: 'BidBadEgg',
        match: ['*://*/*'],
        grant: ['GM_setClipboard', 'GM_setValue', 'GM_getValue', 'unsafeWindow'],
        'run-at': 'document-start',
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});

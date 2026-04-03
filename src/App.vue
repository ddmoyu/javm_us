<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import type { M3u8Item } from './collector'
import { loadPlayers, savePlayers, formatPlayerUrl, type PlayerConfig, loadBubblePosition, saveBubblePosition, loadRememberPosition, saveRememberPosition } from './players'

const collector = inject<ReturnType<typeof import('./collector').createCollector>>('collector')!

// 从 userscript 元数据读取版本号
const version = typeof GM_info !== 'undefined' ? GM_info.script.version : '1.0.1'

const items = ref<M3u8Item[]>([])
const showPanel = ref(false)
const showSettings = ref(false)
const showAbout = ref(false)
const toastMsg = ref('')
const bubblePressed = ref(false)
let toastTimer = 0
let offChange: (() => void) | null = null

// 播放器配置
const players = ref<PlayerConfig[]>(loadPlayers())
const enabledPlayers = computed(() => players.value.filter((p) => p.enabled))

// 新增播放器表单
const newPlayer = ref({ name: '', icon: '🔗', template: '' })

// 气泡位置拖拽
const rememberPos = ref(loadRememberPosition())
const bubblePos = ref(loadBubblePosition() ?? { bottom: 24, right: 24 })
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let dragStartRight = 0
let dragStartBottom = 0
let hasMoved = false

function onBubblePointerDown(e: PointerEvent) {
  bubblePressed.value = true
  isDragging.value = false
  hasMoved = false
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartRight = bubblePos.value.right
  dragStartBottom = bubblePos.value.bottom
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  if (!hasMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return
  hasMoved = true
  isDragging.value = true
  const maxRight = window.innerWidth - 56
  const maxBottom = window.innerHeight - 56
  bubblePos.value = {
    right: Math.max(0, Math.min(maxRight, dragStartRight - dx)),
    bottom: Math.max(0, Math.min(maxBottom, dragStartBottom - dy)),
  }
}

function onPointerUp() {
  bubblePressed.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (isDragging.value && rememberPos.value) {
    saveBubblePosition(bubblePos.value)
  }
  // 延迟重置，避免 click 事件触发
  setTimeout(() => { isDragging.value = false }, 0)
}

function onBubbleClick() {
  if (hasMoved) return
  togglePanel()
}

// 面板位置计算：防止拖到左侧时面板被裁切
const panelStyle = computed(() => {
  const panelWidth = 500
  const margin = 8
  const panelLeftEdge = windowWidth.value - bubblePos.value.right - panelWidth
  if (panelLeftEdge < margin) {
    const offset = margin - panelLeftEdge
    return { transform: `translateX(${offset}px)` }
  }
  return {}
})

function toggleRememberPos() {
  rememberPos.value = !rememberPos.value
  saveRememberPosition(rememberPos.value)
  if (rememberPos.value) {
    saveBubblePosition(bubblePos.value)
  }
}

function resetPosition() {
  bubblePos.value = { bottom: 24, right: 24 }
  if (rememberPos.value) {
    saveBubblePosition(bubblePos.value)
  }
  toast('已重置位置')
}

function onWindowResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  items.value = collector.getItems()
  offChange = collector.onChange(() => {
    items.value = collector.getItems()
  })
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  offChange?.()
  window.removeEventListener('resize', onWindowResize)
})

function togglePanel() {
  showPanel.value = !showPanel.value
  showSettings.value = false
  showAbout.value = false
}

function toast(msg: string) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toastMsg.value = ''), 2000)
}

function copyUrl(url: string) {
  GM_setClipboard(url)
  toast('已复制链接')
}

const downloadedUrls = new Set<string>()

function downloadJavm(item: M3u8Item, index: number) {
  if (downloadedUrls.has(item.url)) {
    toast('该任务已发送，请勿重复下载')
    return
  }
  let title = document.title || item.filename
  if (items.value.length > 1) {
    title += `_${index + 1}`
  }
  const deeplink = `javm://download?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(title)}`
  downloadedUrls.add(item.url)
  location.href = deeplink
  toast('已发送到 JAVM')
}

function launchPlayer(player: PlayerConfig, url: string) {
  const href = formatPlayerUrl(player.template, url)
  const a = document.createElement('a')
  a.href = href
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  toast(`已调用 ${player.name}`)
}

// 设置操作
function togglePlayer(id: string) {
  const p = players.value.find((x) => x.id === id)
  if (p) {
    p.enabled = !p.enabled
    savePlayers(players.value)
  }
}

function removePlayer(id: string) {
  players.value = players.value.filter((x) => x.id !== id)
  savePlayers(players.value)
}

function addPlayer() {
  const { name, icon, template } = newPlayer.value
  if (!name.trim() || !template.trim()) {
    toast('名称和协议模板不能为空')
    return
  }
  const id = `custom-${Date.now()}`
  players.value.push({ id, name: name.trim(), icon: icon.trim() || '🔗', template: template.trim(), enabled: true, builtin: false })
  savePlayers(players.value)
  newPlayer.value = { name: '', icon: '🔗', template: '' }
  toast(`已添加 ${name}`)
}
</script>

<template>
  <div class="javm-root" :style="{ bottom: bubblePos.bottom + 'px', right: bubblePos.right + 'px' }">
    <!-- 悬浮气泡 -->
    <Transition name="bubble">
      <div v-if="items.length > 0" class="javm-bubble-wrap">
        <div class="javm-bubble-ring"></div>
        <button
          class="javm-bubble"
          :class="{ active: showPanel, pressed: bubblePressed, dragging: isDragging }"
          @click="onBubbleClick"
          @pointerdown="onBubblePointerDown"
          :title="`发现 ${items.length} 个 m3u8 流`"
        >
          <svg class="javm-bubble-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span class="javm-bubble-num">{{ items.length }}</span>
        </button>
      </div>
    </Transition>

    <!-- 面板 -->
    <Transition name="panel">
      <div v-if="showPanel && items.length > 0" class="javm-panel" :style="panelStyle">
        <div class="javm-panel-glow"></div>

        <!-- 标题栏 -->
        <div class="javm-panel-header">
          <div class="javm-panel-title-area">
            <Transition name="title-swap" mode="out-in">
              <span v-if="!showSettings && !showAbout" key="list" class="javm-panel-title">M3U8 流</span>
              <span v-else-if="showSettings" key="settings" class="javm-panel-title">播放器设置</span>
              <span v-else key="about" class="javm-panel-title">关于</span>
            </Transition>
            <span v-if="!showSettings && !showAbout" class="javm-panel-count">{{ items.length }}</span>
          </div>
          <div class="javm-header-actions">
            <button class="javm-icon-btn" :class="{ 'is-active': showSettings }" @click="showSettings = !showSettings; showAbout = false" title="设置">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <button class="javm-icon-btn" :class="{ 'is-active': showAbout }" @click="showAbout = !showAbout; showSettings = false" title="关于">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
            <button class="javm-icon-btn javm-close-btn" @click="showPanel = false" title="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 流列表 -->
        <Transition name="view-swap" mode="out-in">
          <div v-if="!showSettings && !showAbout" key="list" class="javm-panel-body">
            <TransitionGroup name="list-item" tag="div">
              <div v-for="(item, i) in items" :key="item.url" class="javm-item" :style="{ '--i': i }">
                <div class="javm-item-info">
                  <span class="javm-badge">{{ item.resolution }}</span>
                  <span class="javm-filename" :title="item.url">{{ item.filename }}</span>
                </div>
                <div class="javm-actions">
                  <button class="javm-act-btn javm-act-copy" @click="copyUrl(item.url)" title="复制链接">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button class="javm-act-btn javm-act-dl" @click="downloadJavm(item, i)" title="JAVM 下载">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button
                    v-for="p in enabledPlayers"
                    :key="p.id"
                    class="javm-act-btn javm-act-player"
                    @click="launchPlayer(p, item.url)"
                    :title="p.name"
                  >{{ p.icon }}</button>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- 设置面板 -->
          <div v-else-if="showSettings" key="settings" class="javm-panel-body javm-settings">
            <div class="javm-settings-section">
              <div class="javm-settings-label">播放器列表</div>
              <TransitionGroup name="list-item" tag="div">
                <div v-for="(p, i) in players" :key="p.id" class="javm-setting-row" :style="{ '--i': i }">
                  <label class="javm-switch">
                    <input type="checkbox" :checked="p.enabled" @change="togglePlayer(p.id)" />
                    <span class="javm-slider"></span>
                  </label>
                  <span class="javm-setting-icon">{{ p.icon }}</span>
                  <span class="javm-setting-name">{{ p.name }}</span>
                  <span class="javm-setting-tpl">{{ p.template }}</span>
                  <button v-if="!p.builtin" class="javm-setting-del" @click="removePlayer(p.id)" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  <span v-else class="javm-setting-tag">内置</span>
                </div>
              </TransitionGroup>
            </div>

            <div class="javm-settings-section">
              <div class="javm-settings-label">气泡位置</div>
              <div class="javm-setting-row">
                <label class="javm-switch">
                  <input type="checkbox" :checked="rememberPos" @change="toggleRememberPos" />
                  <span class="javm-slider"></span>
                </label>
                <span class="javm-setting-name" style="flex:1">记住位置</span>
                <button class="javm-reset-btn" @click="resetPosition" title="重置到右下角">重置</button>
              </div>
              <div class="javm-hint">拖拽气泡按钮可自由移动位置</div>
            </div>

            <div class="javm-settings-section">
              <div class="javm-settings-label">添加自定义播放器</div>
              <div class="javm-add-form">
                <input v-model="newPlayer.icon" class="javm-input javm-input-icon" placeholder="📦" maxlength="2" />
                <input v-model="newPlayer.name" class="javm-input javm-input-name" placeholder="名称" />
                <input v-model="newPlayer.template" class="javm-input javm-input-tpl" placeholder="proto://{url}" />
                <button class="javm-add-btn" @click="addPlayer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div class="javm-hint">
                模板变量: <code>{url}</code> 原始链接 · <code>{encoded_url}</code> 编码后链接
              </div>
            </div>
          </div>

          <!-- 关于面板 -->
          <div v-else key="about" class="javm-panel-body javm-about">
            <div class="javm-about-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div class="javm-about-name">JAVM M3U8 Helper</div>
            <div class="javm-about-ver">v{{ version }}</div>
            <div class="javm-about-desc">自动检测页面中的 m3u8 视频流，一键下载或播放。</div>
            <div class="javm-about-links">
              <a class="javm-about-link" href="https://github.com/ddmoyu/javm" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                <div class="javm-about-link-text">
                  <span class="javm-about-link-title">JAVM</span>
                  <span class="javm-about-link-sub">Jav 视频管理工具，包含：刮削，下载，播放</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </a>
              <a class="javm-about-link" href="https://github.com/ddmoyu/javm_us" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                <div class="javm-about-link-text">
                  <span class="javm-about-link-title">JAVM UserScript</span>
                  <span class="javm-about-link-sub">M3U8 检测油猴脚本，配合 JAVM 使用</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;opacity:0.4"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </a>
            </div>
          </div>
        </Transition>

        <!-- Toast -->
        <Transition name="toast">
          <div v-if="toastMsg" class="javm-toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {{ toastMsg }}
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ============================================================
   全局容器
   ============================================================ */
.javm-root {
  all: initial;
  position: fixed !important;
  z-index: 2147483647 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 12px !important;
  -webkit-font-smoothing: antialiased !important;
}

/* ============================================================
   悬浮气泡按钮
   ============================================================ */
.javm-bubble-wrap {
  position: relative !important;
  width: 48px !important;
  height: 48px !important;
}

/* 呼吸光圈 */
.javm-bubble-ring {
  position: absolute !important;
  inset: -4px !important;
  border-radius: 50% !important;
  border: 2px solid rgba(99, 102, 241, 0.4) !important;
  animation: javm-ring-pulse 2s ease-in-out infinite !important;
  pointer-events: none !important;
}

@keyframes javm-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0; }
}

.javm-bubble {
  all: unset;
  position: relative !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%) !important;
  color: #fff !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow:
    0 4px 15px rgba(99, 102, 241, 0.4),
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-radius 0.25s ease !important;
  user-select: none !important;
}
.javm-bubble::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%) !important;
  pointer-events: none !important;
}
.javm-bubble:hover {
  transform: translateY(-2px) scale(1.08) !important;
  box-shadow:
    0 8px 25px rgba(99, 102, 241, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  border-radius: 14px !important;
}
.javm-bubble.pressed {
  transform: translateY(0px) scale(0.95) !important;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}
.javm-bubble.active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  border-radius: 14px !important;
}
.javm-bubble.dragging {
  cursor: grabbing !important;
  transform: scale(1.12) !important;
  box-shadow:
    0 10px 30px rgba(99, 102, 241, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transition: none !important;
}

.javm-bubble-icon {
  width: 20px !important;
  height: 20px !important;
  flex-shrink: 0 !important;
  opacity: 0.9 !important;
}

.javm-bubble-num {
  position: absolute !important;
  top: -6px !important;
  right: -6px !important;
  min-width: 20px !important;
  height: 20px !important;
  border-radius: 10px !important;
  background: #ef4444 !important;
  color: #fff !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 5px !important;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4) !important;
  animation: javm-num-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  z-index: 1 !important;
}

@keyframes javm-num-pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* ============================================================
   面板
   ============================================================ */
.javm-panel {
  all: unset;
  display: block !important;
  width: 500px !important;
  max-height: 440px !important;
  background: rgba(15, 15, 26, 0.92) !important;
  backdrop-filter: blur(20px) saturate(1.5) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.5) !important;
  border: 1px solid rgba(99, 102, 241, 0.15) !important;
  border-radius: 16px !important;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 80px -20px rgba(99, 102, 241, 0.15) !important;
  overflow: hidden !important;
  color: #e2e8f0 !important;
  position: relative !important;
}

/* 顶部渐变光效 */
.javm-panel-glow {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 80px !important;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent) !important;
  pointer-events: none !important;
}

/* 标题栏 */
.javm-panel-header {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 14px 16px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}
.javm-panel-title-area {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.javm-panel-title {
  font-weight: 600 !important;
  font-size: 14px !important;
  color: #f1f5f9 !important;
  letter-spacing: -0.01em !important;
}
.javm-panel-count {
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #a5b4fc !important;
  background: rgba(99, 102, 241, 0.15) !important;
  padding: 2px 8px !important;
  border-radius: 10px !important;
  letter-spacing: 0.02em !important;
}

.javm-header-actions {
  display: flex !important;
  gap: 4px !important;
}

.javm-icon-btn {
  all: unset;
  width: 30px !important;
  height: 30px !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  color: #64748b !important;
  transition: all 0.2s ease !important;
}
.javm-icon-btn svg {
  width: 16px !important;
  height: 16px !important;
  transition: transform 0.3s ease !important;
}
.javm-icon-btn:hover {
  color: #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.08) !important;
}
.javm-icon-btn:hover svg { transform: rotate(30deg) !important; }
.javm-icon-btn.is-active {
  color: #a5b4fc !important;
  background: rgba(99, 102, 241, 0.15) !important;
}
.javm-icon-btn.is-active svg { transform: rotate(90deg) !important; }
.javm-close-btn:hover {
  color: #fca5a5 !important;
  background: rgba(239, 68, 68, 0.12) !important;
}
.javm-close-btn:hover svg { transform: rotate(0deg) scale(1.1) !important; }

/* ============================================================
   列表区域
   ============================================================ */
.javm-panel-body {
  overflow-y: auto !important;
  max-height: 370px !important;
  scroll-behavior: smooth !important;
}
.javm-panel-body::-webkit-scrollbar { width: 5px !important; }
.javm-panel-body::-webkit-scrollbar-track { background: transparent !important; }
.javm-panel-body::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.25) !important;
  border-radius: 5px !important;
}
.javm-panel-body::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.45) !important;
}

/* ============================================================
   流列表行
   ============================================================ */
.javm-item {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 16px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  transition: all 0.2s ease !important;
  position: relative !important;
}
.javm-item::before {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 3px !important;
  background: linear-gradient(180deg, #6366f1, #a855f7) !important;
  border-radius: 0 2px 2px 0 !important;
  opacity: 0 !important;
  transform: scaleY(0.5) !important;
  transition: opacity 0.2s, transform 0.2s !important;
}
.javm-item:last-child { border-bottom: none !important; }
.javm-item:hover {
  background: rgba(99, 102, 241, 0.06) !important;
}
.javm-item:hover::before {
  opacity: 1 !important;
  transform: scaleY(1) !important;
}

.javm-item-info {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex: 1 !important;
  min-width: 0 !important;
}
.javm-badge {
  flex-shrink: 0 !important;
  background: rgba(99, 102, 241, 0.12) !important;
  color: #a5b4fc !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 3px 8px !important;
  border-radius: 6px !important;
  white-space: nowrap !important;
  border: 1px solid rgba(99, 102, 241, 0.1) !important;
  letter-spacing: 0.02em !important;
}
.javm-filename {
  color: #94a3b8 !important;
  font-size: 12px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* ============================================================
   操作按钮
   ============================================================ */
.javm-actions {
  display: flex !important;
  gap: 2px !important;
  flex-shrink: 0 !important;
  opacity: 0.6 !important;
  transition: opacity 0.2s !important;
}
.javm-item:hover .javm-actions {
  opacity: 1 !important;
}

.javm-act-btn {
  all: unset;
  width: 30px !important;
  height: 30px !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  position: relative !important;
  color: #94a3b8 !important;
}
.javm-act-btn svg {
  width: 15px !important;
  height: 15px !important;
}
.javm-act-btn:hover {
  transform: translateY(-2px) !important;
}
.javm-act-btn:active {
  transform: translateY(0) scale(0.92) !important;
}

.javm-act-copy:hover  { background: rgba(59, 130, 246, 0.15) !important; color: #60a5fa !important; }
.javm-act-dl:hover    { background: rgba(239, 68, 68, 0.15) !important; color: #f87171 !important; }
.javm-act-player      { font-size: 15px !important; }
.javm-act-player:hover { background: rgba(168, 85, 247, 0.15) !important; }

/* ============================================================
   设置面板
   ============================================================ */
.javm-settings { padding: 4px 0 !important; }
.javm-settings-section { padding: 10px 16px 12px !important; }
.javm-settings-section + .javm-settings-section { border-top: 1px solid rgba(255, 255, 255, 0.05) !important; }
.javm-settings-label {
  font-size: 11px !important;
  color: #64748b !important;
  font-weight: 600 !important;
  margin-bottom: 10px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
}

.javm-setting-row {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 6px 8px !important;
  border-radius: 8px !important;
  margin: 2px -8px !important;
  transition: background 0.15s !important;
}
.javm-setting-row:hover { background: rgba(255, 255, 255, 0.03) !important; }
.javm-setting-icon { font-size: 16px !important; width: 22px !important; text-align: center !important; }
.javm-setting-name { font-size: 13px !important; font-weight: 500 !important; color: #e2e8f0 !important; min-width: 70px !important; }
.javm-setting-tpl {
  font-size: 11px !important;
  color: #475569 !important;
  flex: 1 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace !important;
}
.javm-setting-del {
  all: unset;
  cursor: pointer !important;
  color: #475569 !important;
  width: 22px !important;
  height: 22px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 6px !important;
  transition: all 0.2s !important;
}
.javm-setting-del:hover { color: #fca5a5 !important; background: rgba(239, 68, 68, 0.12) !important; }
.javm-setting-tag {
  font-size: 10px !important;
  color: #64748b !important;
  background: rgba(99, 102, 241, 0.1) !important;
  padding: 2px 8px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
}

.javm-reset-btn {
  all: unset;
  cursor: pointer !important;
  font-size: 11px !important;
  color: #a5b4fc !important;
  background: rgba(99, 102, 241, 0.12) !important;
  padding: 3px 10px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}
.javm-reset-btn:hover {
  background: rgba(99, 102, 241, 0.25) !important;
  color: #c7d2fe !important;
}

/* Toggle 开关 */
.javm-switch {
  position: relative !important;
  display: inline-block !important;
  width: 36px !important;
  height: 20px !important;
  flex-shrink: 0 !important;
}
.javm-switch input { opacity: 0 !important; width: 0 !important; height: 0 !important; position: absolute !important; }
.javm-slider {
  position: absolute !important;
  cursor: pointer !important;
  inset: 0 !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.javm-slider::before {
  content: '' !important;
  position: absolute !important;
  width: 16px !important;
  height: 16px !important;
  left: 2px !important;
  bottom: 2px !important;
  background: #475569 !important;
  border-radius: 50% !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}
.javm-switch input:checked + .javm-slider {
  background: rgba(99, 102, 241, 0.25) !important;
}
.javm-switch input:checked + .javm-slider::before {
  transform: translateX(16px) !important;
  background: #818cf8 !important;
  box-shadow: 0 0 8px rgba(129, 140, 248, 0.4) !important;
}

/* 新增表单 */
.javm-add-form {
  display: flex !important;
  gap: 6px !important;
  align-items: center !important;
}
.javm-input {
  all: unset;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 7px 10px !important;
  font-size: 12px !important;
  color: #e2e8f0 !important;
  transition: all 0.2s ease !important;
}
.javm-input::placeholder { color: #475569 !important; }
.javm-input:focus {
  border-color: rgba(99, 102, 241, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
  background: rgba(255, 255, 255, 0.06) !important;
}
.javm-input-icon { width: 32px !important; text-align: center !important; font-size: 15px !important; }
.javm-input-name { width: 76px !important; }
.javm-input-tpl {
  flex: 1 !important;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace !important;
  font-size: 11px !important;
}
.javm-add-btn {
  all: unset;
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  background: rgba(99, 102, 241, 0.15) !important;
  color: #a5b4fc !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
}
.javm-add-btn svg { width: 16px !important; height: 16px !important; }
.javm-add-btn:hover {
  background: rgba(99, 102, 241, 0.25) !important;
  color: #c7d2fe !important;
  transform: scale(1.05) !important;
}
.javm-add-btn:active { transform: scale(0.95) !important; }

.javm-hint {
  font-size: 11px !important;
  color: #475569 !important;
  margin-top: 8px !important;
  line-height: 1.6 !important;
}
.javm-hint code {
  color: #a5b4fc !important;
  background: rgba(99, 102, 241, 0.1) !important;
  padding: 1px 5px !important;
  border-radius: 4px !important;
  font-size: 10px !important;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace !important;
}

/* ============================================================
   关于面板
   ============================================================ */
.javm-about {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  padding: 28px 24px 24px !important;
  gap: 6px !important;
}
.javm-about-logo {
  width: 48px !important;
  height: 48px !important;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 4px !important;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3) !important;
}
.javm-about-logo svg {
  width: 24px !important;
  height: 24px !important;
  color: #fff !important;
}
.javm-about-name {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #f1f5f9 !important;
  letter-spacing: -0.02em !important;
}
.javm-about-ver {
  font-size: 11px !important;
  color: #64748b !important;
  background: rgba(99, 102, 241, 0.1) !important;
  padding: 2px 10px !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
}
.javm-about-desc {
  font-size: 12px !important;
  color: #94a3b8 !important;
  text-align: center !important;
  margin: 4px 0 12px !important;
  line-height: 1.5 !important;
}
.javm-about-links {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  width: 100% !important;
}
.javm-about-link {
  all: unset;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 12px 14px !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  cursor: pointer !important;
  color: #94a3b8 !important;
  transition: all 0.2s ease !important;
  text-decoration: none !important;
}
.javm-about-link:hover {
  background: rgba(99, 102, 241, 0.08) !important;
  border-color: rgba(99, 102, 241, 0.2) !important;
  transform: translateY(-1px) !important;
}
.javm-about-link-text {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  min-width: 0 !important;
}
.javm-about-link-title {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #e2e8f0 !important;
}
.javm-about-link-sub {
  font-size: 11px !important;
  color: #64748b !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* ============================================================
   Toast
   ============================================================ */
.javm-toast {
  position: absolute !important;
  bottom: 12px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  background: rgba(15, 23, 42, 0.9) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(99, 102, 241, 0.15) !important;
  color: #e2e8f0 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  padding: 6px 14px !important;
  border-radius: 10px !important;
  pointer-events: none !important;
  white-space: nowrap !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
}

/* ============================================================
   动画
   ============================================================ */

/* 气泡入场 */
.bubble-enter-active {
  transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.bubble-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease !important;
}
.bubble-enter-from {
  opacity: 0 !important;
  transform: scale(0.3) rotate(-30deg) !important;
}
.bubble-leave-to {
  opacity: 0 !important;
  transform: scale(0.5) !important;
}

/* 面板入场 */
.panel-enter-active {
  transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}
.panel-enter-from {
  opacity: 0 !important;
  transform: translateY(20px) scale(0.95) !important;
}
.panel-leave-to {
  opacity: 0 !important;
  transform: translateY(10px) scale(0.98) !important;
}

/* 标题切换 */
.title-swap-enter-active, .title-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease !important;
}
.title-swap-enter-from { opacity: 0 !important; transform: translateY(-6px) !important; }
.title-swap-leave-to   { opacity: 0 !important; transform: translateY(6px) !important; }

/* 列表/设置视图切换 */
.view-swap-enter-active {
  transition: opacity 0.2s ease 0.05s, transform 0.25s ease !important;
}
.view-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease !important;
}
.view-swap-enter-from { opacity: 0 !important; transform: translateX(12px) !important; }
.view-swap-leave-to   { opacity: 0 !important; transform: translateX(-12px) !important; }

/* 列表项动画 */
.list-item-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  transition-delay: calc(var(--i, 0) * 0.04s) !important;
}
.list-item-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}
.list-item-enter-from {
  opacity: 0 !important;
  transform: translateX(16px) !important;
}
.list-item-leave-to {
  opacity: 0 !important;
  transform: translateX(-16px) scale(0.95) !important;
}
.list-item-move {
  transition: transform 0.3s ease !important;
}

/* Toast */
.toast-enter-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}
.toast-enter-from {
  opacity: 0 !important;
  transform: translateX(-50%) translateY(8px) scale(0.9) !important;
}
.toast-leave-to {
  opacity: 0 !important;
  transform: translateX(-50%) translateY(-4px) !important;
}
</style>


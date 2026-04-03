export interface PlayerConfig {
  id: string
  name: string
  icon: string
  /** 协议格式模板，用 {url} 表示原始链接，{encoded_url} 表示编码后的链接 */
  template: string
  enabled: boolean
  builtin: boolean
}

const STORAGE_KEY = 'javm-players'

/** 安全读取存储 (GM API → localStorage fallback) */
function storageGet(key: string): string {
  try {
    if (typeof GM_getValue === 'function') {
      const v = GM_getValue(key, '')
      if (v) return typeof v === 'string' ? v : JSON.stringify(v)
    }
  } catch { /* ignore */ }
  try {
    return localStorage.getItem(key) ?? ''
  } catch { /* ignore */ }
  return ''
}

/** 安全写入存储 (GM API + localStorage 双写) */
function storageSet(key: string, value: string): void {
  try {
    if (typeof GM_setValue === 'function') GM_setValue(key, value)
  } catch { /* ignore */ }
  try {
    localStorage.setItem(key, value)
  } catch { /* ignore */ }
}

export const DEFAULT_PLAYERS: PlayerConfig[] = [
  { id: 'potplayer', name: 'PotPlayer', icon: '🎬', template: 'potplayer://{url}', enabled: true, builtin: true },
  { id: 'vlc', name: 'VLC', icon: '📡', template: 'vlc://{encoded_url}', enabled: true, builtin: true },
  { id: 'mpc-hc', name: 'MPC-HC', icon: '🖥', template: 'mpc-hc://open/file?url={encoded_url}', enabled: true, builtin: true },
  { id: 'mpv', name: 'MPV', icon: '🎵', template: 'mpv://play/?url={encoded_url}', enabled: true, builtin: true },
]

/** 将模板转换为实际 URL */
export function formatPlayerUrl(template: string, rawUrl: string): string {
  return template
    .replace(/\{url\}/g, rawUrl)
    .replace(/\{encoded_url\}/g, encodeURIComponent(rawUrl))
}

/** 从存储读取播放器配置 */
export function loadPlayers(): PlayerConfig[] {
  try {
    const raw = storageGet(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_PLAYERS)
    const saved: PlayerConfig[] = JSON.parse(raw)
    // 确保内置播放器不会丢失（版本升级时新增的）
    const map = new Map(saved.map((p) => [p.id, p]))
    for (const def of DEFAULT_PLAYERS) {
      if (!map.has(def.id)) {
        saved.push({ ...def })
      }
    }
    return saved
  } catch {
    return structuredClone(DEFAULT_PLAYERS)
  }
}

/** 保存播放器配置到存储 */
export function savePlayers(players: PlayerConfig[]): void {
  storageSet(STORAGE_KEY, JSON.stringify(players))
}

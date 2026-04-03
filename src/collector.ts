export interface M3u8Item {
  url: string
  resolution: string
  filename: string
}

/** 检查 URL 是否为 m3u8/m3u */
function checkUrl(url: string): boolean {
  try {
    const u = new URL(url, location.href)
    return u.pathname.endsWith('.m3u8') || u.pathname.endsWith('.m3u')
  } catch {
    return /\.m3u8?(?:[?#]|$)/i.test(url)
  }
}

/** 检查响应内容是否为 m3u8 */
function checkContent(content: string): boolean {
  return content.trim().startsWith('#EXTM3U')
}

function guessResolution(url: string, index: number): string {
  const m = url.match(/[_\-/](\d{3,4})[pP]|(\d{3,4})x\d{3,4}|[_\-](hd|sd|fhd|uhd|4k|2k|1080|720|480|360)[_\-/]/i)
  if (m) {
    if (m[1]) return `${m[1]}p`
    if (m[2]) return `${m[2]}p`
    if (m[3]) return m[3].toUpperCase()
  }
  return `流 ${index + 1}`
}

function urlToFilename(url: string): string {
  try {
    const path = new URL(url).pathname
    return decodeURIComponent(path.split('/').pop() ?? url)
  } catch {
    return url
  }
}

function buildItems(urls: string[]): M3u8Item[] {
  return urls.map((url, i) => ({
    url,
    resolution: guessResolution(url, i),
    filename: urlToFilename(url),
  }))
}

/** 扫描 video/source 标签 */
function scanVideoElements(): string[] {
  const urls: string[] = []
  document.querySelectorAll<HTMLElement>('video, source, video source').forEach((el) => {
    const src = (el as HTMLVideoElement).src || el.getAttribute('src') || ''
    if (checkUrl(src)) urls.push(src)
    const dataSrc = el.getAttribute('data-src') || ''
    if (checkUrl(dataSrc)) urls.push(dataSrc)
  })
  return urls
}

/**
 * Hook 网络请求，参考 greasyfork 脚本逻辑：
 * 1. Hook Response.prototype.text 检查响应体是否包含 #EXTM3U
 * 2. Hook XMLHttpRequest.prototype.open 监听 load 事件检查 responseText
 */
function hookNetwork(onFound: (url: string) => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window) as any

  // Hook Response.prototype.text — 拦截 fetch 响应体
  const origResponseText: () => Promise<string> = w.Response.prototype.text
  w.Response.prototype.text = function (this: Response) {
    return new Promise<string>((resolve, reject) => {
      origResponseText.call(this).then((text: string) => {
        resolve(text)
        // 检查内容是否为 m3u8
        if (checkContent(text)) {
          onFound(this.url)
        }
      }).catch(reject)
    })
  }

  // Hook XMLHttpRequest.prototype.open — 监听 load 事件检查 responseText
  const origOpen: typeof XMLHttpRequest.prototype.open = w.XMLHttpRequest.prototype.open
  w.XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: unknown[]) {
    this.addEventListener('load', () => {
      try {
        const content = this.responseText
        if (checkContent(content)) {
          onFound(args[1] as string)
        }
      } catch {
        // responseText 可能在某些 responseType 下不可读，忽略
      }
      // 同时检查 URL 模式
      try {
        const reqUrl = String(args[1])
        if (checkUrl(reqUrl)) {
          onFound(reqUrl)
        }
      } catch {
        // 忽略
      }
    })
    // @ts-expect-error spread rest args
    return origOpen.apply(this, args)
  }
}

export function createCollector() {
  const found = new Set<string>()
  const listeners = new Set<() => void>()

  function notify() {
    listeners.forEach((fn) => fn())
  }

  function add(url: string) {
    const clean = url.trim()
    if (!clean || found.has(clean)) return
    // 标准化 URL
    try {
      const full = new URL(clean, location.href).href
      if (found.has(full)) return
      found.add(full)
    } catch {
      found.add(clean)
    }
    notify()
  }

  function onChange(fn: () => void): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  function getItems(): M3u8Item[] {
    return buildItems([...found])
  }

  // 网络请求 hook（尽早注入）
  hookNetwork(add)

  // 定时扫描 video 元素（兼容动态加载的播放器）
  setInterval(() => {
    scanVideoElements().forEach(add)
  }, 1500)

  // MutationObserver 作为补充
  const observer = new MutationObserver(() => {
    scanVideoElements().forEach(add)
  })
  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true })
  } else {
    // document-start 时 documentElement 可能还不存在
    const waitDOM = setInterval(() => {
      if (document.documentElement) {
        clearInterval(waitDOM)
        observer.observe(document.documentElement, { childList: true, subtree: true })
      }
    }, 50)
  }

  return { add, onChange, getItems }
}

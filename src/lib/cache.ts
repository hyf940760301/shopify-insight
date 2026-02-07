/**
 * 内存缓存模块
 *
 * 用于缓存同一店铺 URL 的分析结果，确保短时间内多次请求返回一致的报告。
 * - LRU 淘汰策略，最多缓存 50 个店铺
 * - 默认 24 小时 TTL，过期自动失效
 * - 支持 forceRefresh 强制刷新
 */

interface CacheEntry<T> {
  data: T;
  createdAt: number; // timestamp ms
  url: string; // original URL for debugging
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ENTRIES = 50;

class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs = DEFAULT_TTL_MS, maxEntries = MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  /**
   * Normalize URL to a consistent cache key.
   * "https://www.gymshark.com/", "gymshark.com", "http://GYMSHARK.COM"
   * all map to "gymshark.com"
   */
  static normalizeUrl(rawUrl: string): string {
    let url = rawUrl.trim().toLowerCase();
    // Ensure protocol
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    try {
      const parsed = new URL(url);
      // Remove www. prefix, trailing slash, path
      let host = parsed.hostname.replace(/^www\./, "");
      return host;
    } catch {
      // Fallback: just clean the string
      return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    }
  }

  get(rawUrl: string): { data: T; age: number } | null {
    const key = MemoryCache.normalizeUrl(rawUrl);
    const entry = this.store.get(key);

    if (!entry) return null;

    const age = Date.now() - entry.createdAt;
    if (age > this.ttlMs) {
      // Expired
      this.store.delete(key);
      return null;
    }

    // Move to end (most recently accessed) for LRU
    this.store.delete(key);
    this.store.set(key, entry);

    return { data: entry.data, age };
  }

  set(rawUrl: string, data: T): void {
    const key = MemoryCache.normalizeUrl(rawUrl);

    // If already exists, delete first (to update position)
    if (this.store.has(key)) {
      this.store.delete(key);
    }

    // Evict oldest if at capacity
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, {
      data,
      createdAt: Date.now(),
      url: rawUrl,
    });
  }

  has(rawUrl: string): boolean {
    return this.get(rawUrl) !== null;
  }

  delete(rawUrl: string): void {
    const key = MemoryCache.normalizeUrl(rawUrl);
    this.store.delete(key);
  }

  get size(): number {
    return this.store.size;
  }

  /**
   * Format age in human-readable form
   */
  static formatAge(ageMs: number): string {
    const minutes = Math.floor(ageMs / 60000);
    if (minutes < 1) return "刚刚生成";
    if (minutes < 60) return `${minutes} 分钟前生成`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前生成`;
    const days = Math.floor(hours / 24);
    return `${days} 天前生成`;
  }
}

// Singleton cache instance for analysis results
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const analysisCache = new MemoryCache<any>();

export { MemoryCache };

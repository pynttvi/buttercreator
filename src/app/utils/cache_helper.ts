const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function saveToCache(data: unknown, cacheKey: string) {
  const payload = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(cacheKey, JSON.stringify(payload));
}

export function loadFromCache(cacheKey: string) {
  const raw = localStorage.getItem(cacheKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

    if (isExpired) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.data;
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
}
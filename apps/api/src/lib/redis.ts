// Mock Redis implementation using in-memory Map since Docker/Redis is not available
const cache = new Map<string, { value: string; expiresAt: number }>();

export const connectRedis = async () => {
  console.log('Redis mocked with in-memory cache.');
  return {};
};

export const getRedis = () => {
  return {};
};

export const setCache = async (key: string, value: unknown, ttlSeconds = 300) => {
  cache.set(key, {
    value: JSON.stringify(value),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return JSON.parse(item.value);
};

export const deleteCache = async (key: string) => {
  cache.delete(key);
};

export const deletePattern = async (pattern: string) => {
  // Simple mock: just clear everything or match prefix
  const prefix = pattern.replace('*', '');
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

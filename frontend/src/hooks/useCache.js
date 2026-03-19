/**
 * useCache Hook
 * Provides React component access to cache management
 * Usage: const { clearCache, getCacheStatus } = useCache();
 */

import { useState, useCallback } from 'react';
import { clearCache as clearCacheFn, getCacheStatus } from '../services/cachedFetch.js';

export function useCache() {
  const [cacheStats, setCacheStats] = useState(null);

  const clearCache = useCallback((pattern = null) => {
    clearCacheFn(pattern);
    setCacheStats(getCacheStatus());
    console.log('[useCache] Cache cleared:', pattern || 'all');
  }, []);

  const getStats = useCallback(() => {
    const stats = getCacheStatus();
    setCacheStats(stats);
    return stats;
  }, []);

  return {
    clearCache,
    getStats,
    cacheStats
  };
}

export default useCache;

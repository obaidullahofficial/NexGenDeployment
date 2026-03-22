/**
 * Client-side Cache Service
 * - Caches API responses in memory during the session
 * - Prevents duplicate concurrent API calls
 * - Data persists until page refresh
 * - Transparent to existing code
 */

class CacheService {
  constructor() {
    // In-memory cache storage
    this.cache = new Map();
    
    // Track in-flight requests to prevent duplicate calls
    this.inFlightRequests = new Map();
    
    // Cache configuration (time in ms)
    this.defaultTTL = null; // null = cache until refresh
    
    // List of endpoints to cache
    this.cachedEndpoints = [
      '/api/advertisements/active',
      '/api/reviews',
      '/api/society-profiles',
      '/api/plots/society/',
      '/api/plots',
      '/api/advertisements',
      '/api/users',
      '/api/profile'
    ];
  }

  /**
   * Generate cache key from endpoint and params
   */
  generateCacheKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return paramString ? `${endpoint}?${paramString}` : endpoint;
  }

  /**
   * Check if endpoint should be cached
   */
  shouldCache(endpoint) {
    return this.cachedEndpoints.some(cached => endpoint.includes(cached));
  }

  /**
   * Get cached data
   */
  get(cacheKey) {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    // Check if cache has expired (if TTL is set)
    if (cached.ttl && Date.now() > cached.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    console.log(`[Cache] HIT: ${cacheKey}`);
    return cached.data;
  }

  /**
   * Set cached data
   */
  set(cacheKey, data, ttl = this.defaultTTL) {
    const cacheEntry = {
      data,
      ttl,
      expiresAt: ttl ? Date.now() + ttl : null,
      timestamp: Date.now()
    };

    this.cache.set(cacheKey, cacheEntry);
    console.log(`[Cache] SET: ${cacheKey}`);
  }

  /**
   * Wait for in-flight request or return null
   */
  getInFlight(cacheKey) {
    return this.inFlightRequests.get(cacheKey);
  }

  /**
   * Track in-flight request
   */
  setInFlight(cacheKey, promise) {
    this.inFlightRequests.set(cacheKey, promise);
  }

  /**
   * Clear in-flight request
   */
  clearInFlight(cacheKey) {
    this.inFlightRequests.delete(cacheKey);
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(cacheKey) {
    this.cache.delete(cacheKey);
    console.log(`[Cache] INVALIDATED: ${cacheKey}`);
  }

  /**
   * Invalidate all cache or cache matching pattern
   */
  invalidateAll(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      this.inFlightRequests.clear();
      console.log(`[Cache] CLEARED ALL`);
    } else {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
      console.log(`[Cache] CLEARED: ${pattern}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        expiresAt: value.expiresAt
      }))
    };
  }
}

// Export singleton instance
export default new CacheService();

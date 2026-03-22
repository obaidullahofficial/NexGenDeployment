/**
 * API Cache Wrapper
 * Wraps fetch calls to add transparent caching
 * - Caches GET requests automatically
 * - Prevents duplicate concurrent requests
 * - Does not cache POST/PUT/DELETE
 */

import cacheService from './cacheService.js';

/**
 * Wrapped fetch with caching
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} context - Context for logging
 * @returns {Promise<Response>} Fetch response
 */
export async function cachedFetch(url, options = {}, context = 'cachedFetch') {
  const method = options.method || 'GET';
  
  // Only cache GET requests
  if (method !== 'GET') {
    console.log(`[CachedFetch] ${method}: ${url} (not cached)`);
    return fetch(url, options);
  }

  // Check if this endpoint should be cached
  // Remove base URL (supports both localhost and production)
  let endpoint = url.replace('http://localhost:5000', '').replace('https://nexgendeployment.onrender.com', '').split('?')[0];
  if (!cacheService.shouldCache(endpoint)) {
    return fetch(url, options);
  }

  const cacheKey = cacheService.generateCacheKey(url);

  // Check cache first
  const cached = cacheService.get(cacheKey);
  if (cached) {
    // Return cached response wrapped in a Response object
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }

  // Check for in-flight request
  const inFlight = cacheService.getInFlight(cacheKey);
  if (inFlight) {
    console.log(`[CachedFetch] WAIT: ${cacheKey} (request in-flight)`);
    try {
      const data = await inFlight;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'WAIT' }
      });
    } catch (error) {
      if (error instanceof Response) {
        return error.clone();
      }
      throw error;
    }
  }

  // Make the actual request
  console.log(`[CachedFetch] MISS: ${url}`);
  
  const fetchPromise = fetch(url, options).then(async (response) => {
    if (response.ok) {
      const data = await response.json();
      cacheService.set(cacheKey, data);
      return data;
    }
    throw response;
  });

  // Track this request
  cacheService.setInFlight(cacheKey, fetchPromise);

  try {
    const data = await fetchPromise;
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  } catch (errorOrResponse) {
    if (errorOrResponse instanceof Response) {
      return errorOrResponse;
    }
    throw errorOrResponse;
  } finally {
    cacheService.clearInFlight(cacheKey);
  }
}

/**
 * Clear cache for specific pattern or all
 * @param {string} pattern - Pattern to match (e.g., '/advertisements', '/plots')
 */
export function clearCache(pattern = null) {
  cacheService.invalidateAll(pattern);
}

/**
 * Get cache status
 */
export function getCacheStatus() {
  return cacheService.getStats();
}

export default cachedFetch;

const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      this.client = redis.createClient({
        host: process.env.NODE_ENV === 'development' ? "kelime.com" : "redisdb",
        port: 6379,
        password: process.env.REDIS_PASSWORD || "R3d1sP3SS",
        enable_offline_queue: false,
        retry_delay_on_failover: 100,
        max_attempts: 3,
      });

      this.client.on('connect', () => {
        console.log('🔗 [CACHE-SERVICE] Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.log('❌ [CACHE-SERVICE] Redis error:', err.message);
        this.isConnected = false;
        // Redis hatası durumunda memory cache'e geç
        if (!this.memoryCache) {
          this.memoryCache = new Map();
        }
      });

      this.client.on('disconnect', () => {
        console.log('🔌 [CACHE-SERVICE] Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.log('⚠️ [CACHE-SERVICE] Redis connection failed, using memory cache');
      this.isConnected = false;
      this.memoryCache = new Map();
    }
  }

  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else if (this.memoryCache) {
        return this.memoryCache.get(key);
      }
      return null;
    } catch (error) {
      console.log('❌ [CACHE-SERVICE] Get error:', error.message);
      // Redis hatası durumunda memory cache'e geç
      if (!this.memoryCache) {
        this.memoryCache = new Map();
      }
      return this.memoryCache.get(key) || null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
      } else if (this.memoryCache) {
        this.memoryCache.set(key, value);
        // Memory cache için TTL simülasyonu
        setTimeout(() => {
          this.memoryCache.delete(key);
        }, ttl * 1000);
      }
    } catch (error) {
      console.log('❌ [CACHE-SERVICE] Set error:', error.message);
      // Redis hatası durumunda memory cache'e geç
      if (!this.memoryCache) {
        this.memoryCache = new Map();
      }
      this.memoryCache.set(key, value);
    }
  }

  async del(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.log('❌ [CACHE-SERVICE] Delete error:', error.message);
    }
  }

  // Cache key generator
  generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Search cache methods
  async getSearchResult(searchTerm, searchType, searchFilter, limit, page) {
    const key = this.generateKey('search', {
      searchTerm,
      searchType,
      searchFilter: JSON.stringify(searchFilter),
      limit,
      page
    });
    return await this.get(key);
  }

  async setSearchResult(searchTerm, searchType, searchFilter, limit, page, result, ttl = 1800) {
    const key = this.generateKey('search', {
      searchTerm,
      searchType,
      searchFilter: JSON.stringify(searchFilter),
      limit,
      page
    });
    await this.set(key, result, ttl);
  }

  // Stats cache methods
  async getStats(lang) {
    const key = `stats:${lang}:${new Date().toISOString().split('T')[0]}`;
    return await this.get(key);
  }

  async setStats(lang, result, ttl = 3600) {
    const key = `stats:${lang}:${new Date().toISOString().split('T')[0]}`;
    await this.set(key, result, ttl);
  }

  // Site languages cache
  async getSiteLanguages() {
    const key = 'sitelanguages:active';
    return await this.get(key);
  }

  async setSiteLanguages(result, ttl = 7200) {
    const key = 'sitelanguages:active';
    await this.set(key, result, ttl);
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;

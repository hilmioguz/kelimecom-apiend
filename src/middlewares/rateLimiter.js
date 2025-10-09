const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000,                // 1000 istek (ÇOK YÜKSEK - GEÇİCİ)
  skipSuccessfulRequests: true,
});

// Genel API rate limiting - GEÇİCİ OLARAK ÇOK YÜKSEK AYARLANDI
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 100000,              // 100000 istek (GEÇİCİ - NEREDEYSE KAPALI)
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Arama endpoint'leri için özel rate limiting - GEÇİCİ OLARAK ÇOK YÜKSEK AYARLANDI
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 50000,               // 50000 arama isteği (GEÇİCİ - NEREDEYSE KAPALI)
  message: {
    error: 'Çok fazla arama yapıldı. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sitelanguage endpoint'i için özel rate limiting - GEÇİCİ OLARAK ÇOK YÜKSEK AYARLANDI
const sitelanguageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 10000,               // 10000 istek (GEÇİCİ - NEREDEYSE KAPALI)
  message: {
    error: 'Sitelanguage endpoint\'i çok sık kullanılıyor. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  searchLimiter,
  sitelanguageLimiter,
};

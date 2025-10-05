const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20,                  // 20 istek
  skipSuccessfulRequests: true,
});

// Genel API rate limiting - GEÇİCİ OLARAK KAPATILDI
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 5000,                // 1000 istek (çok gevşek)
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Arama endpoint'leri için özel rate limiting - GEÇİCİ OLARAK KAPATILDI
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 100,                 // 100 arama isteği (çok gevşek)
  message: {
    error: 'Çok fazla arama yapıldı. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sitelanguage endpoint'i için özel rate limiting - GEÇİCİ OLARAK KAPATILDI
const sitelanguageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 200,                 // 200 istek (çok gevşek)
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

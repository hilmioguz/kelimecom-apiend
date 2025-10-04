const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20,                  // 20 istek
  skipSuccessfulRequests: true,
});

// Genel API rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 300,                 // 300 istek (daha gevşek)
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Arama endpoint'leri için özel rate limiting
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 30,                  // 30 arama isteği
  message: {
    error: 'Çok fazla arama yapıldı. Lütfen 1 dakika bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sitelanguage endpoint'i için özel rate limiting
const sitelanguageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 dakika
  max: 50,                  // 50 istek (daha gevşek)
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

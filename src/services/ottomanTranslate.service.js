const logger = require('../config/logger');
// const axios = require('axios'); // Harici API kullanılacağı zaman açılacak
// const redisClient = require('../config/redis'); // Redis eklenecekse

/**
 * Türkçe kelimenin Osmanlıca (Arap harfli) karşılığını bulur.
 * Şu an için örnek bir sözlük (mock) ve API altyapısı kurulmuştur.
 * Harici bir çeviri API'si entegre edildiğinde burası güncellenecektir.
 * 
 * @param {string} term - Çevrilecek Türkçe kelime
 * @returns {Promise<string|null>} - Osmanlıca karşılığı veya bulunamazsa null
 */
const translateToOttoman = async (term) => {
  if (!term || typeof term !== 'string') return null;

  const lowerTerm = term.trim().toLowerCase();
  if (lowerTerm.length < 2) return null;

  // TODO: Redis Cache Kontrolü Buraya Eklenecek
  // const cachedTerm = await redisClient.get(`osmanlica:${lowerTerm}`);
  // if (cachedTerm) return cachedTerm;

  try {
    // Geçici Mock Sözlük (En çok aranan kelimeler veya test kelimeleri)
    const mockDictionary = {
      'kalem': 'قلم',
      'kitap': 'كتاب',
      'defter': 'دفتر',
      'su': 'صو',
      'gül': 'گل',
      'niğde': 'نيغدة'
    };

    let ottomanEquivalent = mockDictionary[lowerTerm] || null;

    // TODO: Harici Çeviri API İsteği (API hazır olduğunda açılacak)
    /*
    if (!ottomanEquivalent) {
      const response = await axios.get(`https://api.example.com/translate?text=${encodeURIComponent(lowerTerm)}&to=os`);
      if (response.data && response.data.translated) {
        ottomanEquivalent = response.data.translated;
      }
    }
    */

    // TODO: Bulunan sonucu Redis'e kaydet (1 haftalık cache)
    // if (ottomanEquivalent) {
    //   await redisClient.setex(`osmanlica:${lowerTerm}`, 604800, ottomanEquivalent);
    // }

    return ottomanEquivalent;
  } catch (error) {
    logger.error(`[Ottoman Translate] Çeviri hatası (${term}): ${error.message}`);
    return null; // Çökmeyi önlemek için null dönüyoruz
  }
};

module.exports = {
  translateToOttoman
};

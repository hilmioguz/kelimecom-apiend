const logger = require('../config/logger');
const axios = require('axios'); // Harici API eklendi

/**
 * Türkçe kelimenin Osmanlıca (Arap harfli) karşılığını Wikilala API ile bulur.
 * 
 * @param {string} term - Çevrilecek Türkçe kelime
 * @returns {Promise<string|null>} - Osmanlıca karşılığı veya bulunamazsa null
 */
const translateToOttoman = async (term) => {
  if (!term || typeof term !== 'string') return null;

  const lowerTerm = term.trim().toLowerCase();
  if (lowerTerm.length < 2) return null;

  try {
    // Patronun gönderdiği Wikilala servisine istek atıyoruz
    // Not: Resimde Keywords alanı "{kelime}" şeklinde gösterildiği için süslü parantez ile gönderip, dönen cevaptan temizliyoruz.
    const response = await axios.post('http://api.wikilala.com/translate/latintoottomanv2', {
      Keywords: `{${lowerTerm}}`
    });

    if (response.data && response.data.translate) {
      // API'den gelen "{مرحبا دنيا}" tarzı cevaptaki süslü parantezleri temizle
      let ottomanEquivalent = response.data.translate.replace(/[{}]/g, '').trim();
      return ottomanEquivalent || null;
    }

    return null;
  } catch (error) {
    logger.error(`[Ottoman Translate] Wikilala API hatası (${term}): ${error.message}`);
    return null; // Çökmeyi önlemek için null dönüyoruz
  }
};

module.exports = {
  translateToOttoman
};

/**
 * Arama terimlerini normalize eder
 * Türkçe karakterler (â, î, û) ve Arapça karakterler için normalizasyon yapar
 * @param {string} searchTerm - Normalize edilecek arama terimi
 * @returns {string} - Normalize edilmiş arama terimi (regex pattern)
 */
const normalizeSearchTerm = (searchTerm) => {
  let searchTermConverted = searchTerm.toLowerCase();

  // İlk dönüşümler: şapkalı karakterleri pattern'e çevir
  searchTermConverted = searchTermConverted.replace(/â/g, '[aâ]');
  searchTermConverted = searchTermConverted.replace(/û/g, '[uûü]');
  searchTermConverted = searchTermConverted.replace(/î/g, '[iîı]');
  // eslint-disable-next-line no-useless-escape
  searchTermConverted = searchTermConverted.replace(/ی/g, '[يی]');
  searchTermConverted = searchTermConverted.replace(/ك/g, '[كکگڭ]');
  searchTermConverted = searchTermConverted.replace(/ا/g, '[اأآ]');
  searchTermConverted = searchTermConverted.replace(/ت/g, '[تة]');

  // Eğer pattern yoksa ve karakter varsa, pattern'e çevir
  if (!searchTermConverted.includes('[aâ]') && searchTermConverted.includes('â')) {
    searchTermConverted = searchTermConverted.replace(/â/g, '[aâ]');
  }
  if (!searchTermConverted.includes('[aâ]') && searchTermConverted.includes('a')) {
    searchTermConverted = searchTermConverted.replace(/a/g, '[aâ]');
  }
  if (!searchTermConverted.includes('[uûü]') && searchTermConverted.includes('u')) {
    searchTermConverted = searchTermConverted.replace(/u/g, '[uûü]');
  }
  if (!searchTermConverted.includes('[uûü]') && searchTermConverted.includes('ü')) {
    searchTermConverted = searchTermConverted.replace(/ü/g, '[uûü]');
  }
  if (!searchTermConverted.includes('[uûü]') && searchTermConverted.includes('û')) {
    searchTermConverted = searchTermConverted.replace(/û/g, '[uûü]');
  }
  if (!searchTermConverted.includes('[iîı]') && searchTermConverted.includes('î')) {
    searchTermConverted = searchTermConverted.replace(/î/g, '[iîı]');
  }
  if (!searchTermConverted.includes('[iîı]') && searchTermConverted.includes('ı')) {
    searchTermConverted = searchTermConverted.replace(/ı/g, '[iîı]');
  }
  if (!searchTermConverted.includes('[iîı]') && searchTermConverted.includes('i')) {
    searchTermConverted = searchTermConverted.replace(/i/g, '[iîı]');
  }
  if (!searchTermConverted.includes('[يی]') && searchTermConverted.includes('ي')) {
    searchTermConverted = searchTermConverted.replace(/ي/g, '[يی]');
  }
  if (!searchTermConverted.includes('[كکگڭ]') && searchTermConverted.includes('ك')) {
    searchTermConverted = searchTermConverted.replace(/ك/g, '[كکگڭ]');
  }
  if (!searchTermConverted.includes('[كکگڭ]') && searchTermConverted.includes('ک')) {
    searchTermConverted = searchTermConverted.replace(/ک/g, '[كکگڭ]');
  }
  if (!searchTermConverted.includes('[كکگڭ]') && searchTermConverted.includes('گ')) {
    searchTermConverted = searchTermConverted.replace(/گ/g, '[كکگڭ]');
  }
  if (!searchTermConverted.includes('[كکگڭ]') && searchTermConverted.includes('ڭ')) {
    searchTermConverted = searchTermConverted.replace(/ڭ/g, '[كکگڭ]');
  }
  if (!searchTermConverted.includes('[اأآ]') && searchTermConverted.includes('ا')) {
    searchTermConverted = searchTermConverted.replace(/ا/g, '[اأآ]');
  }
  if (!searchTermConverted.includes('[اأآ]') && searchTermConverted.includes('أ')) {
    searchTermConverted = searchTermConverted.replace(/أ/g, '[اأآ]');
  }
  if (!searchTermConverted.includes('[اأآ]') && searchTermConverted.includes('آ')) {
    searchTermConverted = searchTermConverted.replace(/آ/g, '[اأآ]');
  }
  if (!searchTermConverted.includes('[تة]') && searchTermConverted.includes('ت')) {
    searchTermConverted = searchTermConverted.replace(/ت/g, '[تة]');
  }
  if (!searchTermConverted.includes('[تة]') && searchTermConverted.includes('ة')) {
    searchTermConverted = searchTermConverted.replace(/ة/g, '[تة]');
  }

  return searchTermConverted;
};

/**
 * Elasticsearch için arama terimlerini normalize eder
 * Hem orijinal hem normalize edilmiş varyasyonları döndürür
 * Örnek: "kelam" -> ["kelam", "kelâm"], "kelâm" -> ["kelam", "kelâm"]
 * @param {string} searchTerm - Normalize edilecek arama terimi
 * @returns {Array<string>} - Normalize edilmiş arama terimleri array'i
 */
const normalizeSearchTermForElasticsearch = (searchTerm) => {
  const originalTerm = searchTerm.toLowerCase();
  const terms = new Set([originalTerm]); // Orijinal terim

  // Şapkalı karakterlerin varyasyonlarını oluştur
  // a <-> â
  if (originalTerm.includes('a') || originalTerm.includes('â')) {
    // a -> â
    const withA = originalTerm.replace(/a/g, 'â');
    if (withA !== originalTerm) terms.add(withA);
    
    // â -> a
    const withoutA = originalTerm.replace(/â/g, 'a');
    if (withoutA !== originalTerm) terms.add(withoutA);
  }

  // i <-> î <-> ı
  if (originalTerm.includes('i') || originalTerm.includes('î') || originalTerm.includes('ı')) {
    // i -> î
    const withI = originalTerm.replace(/i/g, 'î').replace(/ı/g, 'î');
    if (withI !== originalTerm) terms.add(withI);
    
    // î -> i
    const withoutI = originalTerm.replace(/î/g, 'i');
    if (withoutI !== originalTerm) terms.add(withoutI);
    
    // î -> ı
    const withDotlessI = originalTerm.replace(/î/g, 'ı');
    if (withDotlessI !== originalTerm) terms.add(withDotlessI);
  }

  // u <-> û <-> ü
  if (originalTerm.includes('u') || originalTerm.includes('û') || originalTerm.includes('ü')) {
    // u -> û
    const withU = originalTerm.replace(/u/g, 'û').replace(/ü/g, 'û');
    if (withU !== originalTerm) terms.add(withU);
    
    // û -> u
    const withoutU = originalTerm.replace(/û/g, 'u');
    if (withoutU !== originalTerm) terms.add(withoutU);
    
    // û -> ü
    const withUmlaut = originalTerm.replace(/û/g, 'ü');
    if (withUmlaut !== originalTerm) terms.add(withUmlaut);
  }

  // Arapça karakterler için de benzer işlemler
  // ي <-> ی
  if (originalTerm.includes('ي') || originalTerm.includes('ی')) {
    const withYe = originalTerm.replace(/ي/g, 'ی');
    if (withYe !== originalTerm) terms.add(withYe);
    const withYeh = originalTerm.replace(/ی/g, 'ي');
    if (withYeh !== originalTerm) terms.add(withYeh);
  }

  // ك <-> ک
  if (originalTerm.includes('ك') || originalTerm.includes('ک')) {
    const withKaf = originalTerm.replace(/ك/g, 'ک');
    if (withKaf !== originalTerm) terms.add(withKaf);
    const withKeh = originalTerm.replace(/ک/g, 'ك');
    if (withKeh !== originalTerm) terms.add(withKeh);
  }

  // ا <-> أ <-> آ
  if (originalTerm.includes('ا') || originalTerm.includes('أ') || originalTerm.includes('آ')) {
    const withAlef = originalTerm.replace(/أ/g, 'ا').replace(/آ/g, 'ا');
    if (withAlef !== originalTerm) terms.add(withAlef);
  }

  // ت <-> ة
  if (originalTerm.includes('ت') || originalTerm.includes('ة')) {
    const withTeh = originalTerm.replace(/ة/g, 'ت');
    if (withTeh !== originalTerm) terms.add(withTeh);
    const withMarbuta = originalTerm.replace(/ت/g, 'ة');
    if (withMarbuta !== originalTerm) terms.add(withMarbuta);
  }

  return Array.from(terms);
};

module.exports = {
  normalizeSearchTerm,
  normalizeSearchTermForElasticsearch,
};

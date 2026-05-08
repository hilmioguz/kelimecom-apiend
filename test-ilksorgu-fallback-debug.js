#!/usr/bin/env node

/**
 * Debug Script - İlksorgu Fallback Karşılaştırma Testi
 *
 * Amaç:
 * - Prefix-only ve prefix+anlam-fallback davranışını karşılaştırmak
 * - Sonuç sayısı, süre ve dönen madde listesini görmek
 *
 * Usage:
 *   node test-ilksorgu-fallback-debug.js
 *   node test-ilksorgu-fallback-debug.js --term "niğde" --limit 7 --threshold 5
 */

require('dotenv').config({ path: '.env' });

const elasticsearchService = require('./src/services/elasticsearch.service');
const { searchMaddeIlksorgu, healthCheck } = elasticsearchService;

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  return args[idx + 1];
};

const asNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const term = getArg('--term', 'niğde');
const limit = asNumber(getArg('--limit', '7'), 7);
const threshold = asNumber(getArg('--threshold', '5'), 5);
const page = asNumber(getArg('--page', '1'), 1);

const runCase = async ({ fallbackEnabled, label }) => {
  const startedAt = Date.now();
  const result = await searchMaddeIlksorgu({
    searchTerm: term,
    searchDil: 'tumu',
    searchTip: 'tumu',
    searchDict: 'tumu',
    filterOrders: 'en,os,fa,tr,ar,fr',
    limit,
    page,
    ilksorguAnlamFallbackEnabled: fallbackEnabled,
    ilksorguAnlamThreshold: threshold,
  });
  const elapsed = Date.now() - startedAt;

  const maddeler = (result.data || []).map((x) => x.madde);
  const hasNekida = maddeler.some((m) => /nek/i.test(m || ''));

  return {
    label,
    elapsed,
    total: result?.meta?.total || 0,
    count: maddeler.length,
    hasNekida,
    maddeler,
  };
};

const printCase = (r) => {
  console.log(`\n=== ${r.label} ===`);
  console.log(`Süre: ${r.elapsed}ms`);
  console.log(`Toplam: ${r.total}`);
  console.log(`Dönen kayıt: ${r.count}`);
  console.log(`Nekîdâ benzeri eşleşme: ${r.hasNekida ? 'EVET' : 'HAYIR'}`);
  console.log('Maddeler:');
  r.maddeler.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m}`);
  });
};

const main = async () => {
  try {
    console.log('🔗 Elasticsearch sağlık kontrolü...');
    const health = await healthCheck();
    console.log('ES Health:', health);

    console.log(`\n🔎 Test terimi: "${term}"`);
    console.log(`Limit: ${limit}, Threshold: ${threshold}, Page: ${page}`);

    const prefixOnly = await runCase({
      fallbackEnabled: false,
      label: 'Case-1 Prefix Only (fallback kapalı)',
    });

    const hybrid = await runCase({
      fallbackEnabled: true,
      label: 'Case-2 Hybrid (fallback açık)',
    });

    printCase(prefixOnly);
    printCase(hybrid);

    console.log('\n=== KARŞILAŞTIRMA ===');
    console.log(`Süre farkı (hybrid - prefix): ${hybrid.elapsed - prefixOnly.elapsed}ms`);
    console.log(`Toplam farkı: ${hybrid.total - prefixOnly.total}`);
    console.log(`Kayıt farkı: ${hybrid.count - prefixOnly.count}`);

    if (!prefixOnly.hasNekida && hybrid.hasNekida) {
      console.log('✅ Beklenen: fallback açılınca Nekîdâ benzeri kayıt görünür oldu.');
    } else {
      console.log('ℹ️ Not: Nekîdâ benzeri kayıt bu testte net ayrışmadı, index verisini kontrol et.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

main();

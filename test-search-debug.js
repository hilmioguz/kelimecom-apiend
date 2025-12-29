#!/usr/bin/env node

/**
 * Test Script - Elasticsearch ve MongoDB Bağlantı Testi
 * 
 * Bu script, geliştirdiğimiz özellikleri test etmek için kullanılır:
 * 1. setKurumsalAccess fonksiyonunu test eder (isActive, packetEnd/endDate kontrolleri)
 * 2. searchMaddeExact fonksiyonunu test eder (isUserActive parametresi ile tüm whichDict kayıtları)
 * 
 * Usage:
 *   node test-search-debug.js
 *   node test-search-debug.js --search "kalem"
 *   node test-search-debug.js --ip "192.168.1.1"
 */

require('dotenv').config({ path: '.env.test' });

const mongoose = require('mongoose');
const config = require('./src/config/config');
const elasticsearchService = require('./src/services/elasticsearch.service');
const { searchMaddeExact, healthCheck, esClient } = elasticsearchService;
const { storeIP, inRange, isV4 } = require('range_check');

// MongoDB bağlantısı
const connectMongo = async () => {
  try {
    console.log('🔗 MongoDB\'ye bağlanılıyor...');
    console.log('📍 URL:', config.mongoose.url.replace(/\/\/.*@/, '//***:***@')); // Şifreyi gizle
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('✅ MongoDB bağlantısı başarılı');
    return true;
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    return false;
  }
};

// Elasticsearch bağlantı testi
const testElasticsearch = async () => {
  try {
    console.log('🔗 Elasticsearch\'e bağlanılıyor...');
    console.log('📍 URL:', config.elasticsearch.url);
    const health = await healthCheck();
    console.log('✅ Elasticsearch bağlantısı başarılı');
    console.log('📊 Durum:', JSON.stringify(health, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Elasticsearch bağlantı hatası:', error.message);
    return false;
  }
};

// setKurumsalAccess test fonksiyonu (basitleştirilmiş)
const testKurumsalAccess = async (testIP) => {
  try {
    console.log('\n🧪 setKurumsalAccess Testi');
    console.log('📍 Test IP:', testIP || '192.168.1.1');
    
    // Kurumları MongoDB'den çek
    const Kurumlar = require('./src/models/kurumlar.model');
    const kurumlar = await Kurumlar.find({}).lean();
    
    console.log(`📊 Toplam ${kurumlar.length} kurum bulundu`);
    
    const ip = storeIP(testIP || '192.168.1.1');
    const now = new Date();
    
    console.log('\n🔍 Kurum Kontrolleri:');
    const ipMatch = kurumlar.filter((kurum) => {
      // 1. IP CIDR range kontrolü
      const ipInRange = inRange(ip, kurum.cidr);
      if (!ipInRange) {
        console.log(`  ❌ ${kurum.institution_name}: IP aralığında değil`);
        return false;
      }
      
      // 2. isActive kontrolü
      if (kurum.isActive !== true) {
        console.log(`  ❌ ${kurum.institution_name}: Aktif değil (isActive: ${kurum.isActive})`);
        return false;
      }
      
      // 3. packetEnd (varsa) veya endDate kontrolü
      let endDateToCheck = null;
      if (kurum.packetEnd) {
        endDateToCheck = new Date(kurum.packetEnd);
        console.log(`  📅 ${kurum.institution_name}: packetEnd kullanılıyor: ${endDateToCheck.toISOString()}`);
      } else if (kurum.endDate) {
        endDateToCheck = new Date(kurum.endDate);
        console.log(`  📅 ${kurum.institution_name}: endDate kullanılıyor: ${endDateToCheck.toISOString()}`);
      }
      
      if (endDateToCheck && endDateToCheck < now) {
        console.log(`  ❌ ${kurum.institution_name}: Abonelik bitmiş (${endDateToCheck.toISOString()} < ${now.toISOString()})`);
        return false;
      }
      
      // 4. beginDate kontrolü
      if (kurum.beginDate) {
        const beginDate = new Date(kurum.beginDate);
        if (beginDate > now) {
          console.log(`  ❌ ${kurum.institution_name}: Abonelik henüz başlamamış`);
          return false;
        }
      }
      
      console.log(`  ✅ ${kurum.institution_name}: Tüm kontroller geçti`);
      return true;
    });
    
    if (ipMatch && ipMatch.length > 0) {
      console.log(`\n✅ ${ipMatch.length} aktif kurum bulundu:`);
      ipMatch.forEach(kurum => {
        console.log(`   - ${kurum.institution_name} (${kurum.isActive ? 'Aktif' : 'Pasif'})`);
      });
      return ipMatch[0];
    } else {
      console.log('\n❌ Aktif kurum bulunamadı');
      return null;
    }
  } catch (error) {
    console.error('❌ Kurum kontrolü hatası:', error.message);
    return null;
  }
};

// searchMaddeExact test fonksiyonu
const testSearchMaddeExact = async (searchTerm, isUserActive = false) => {
  try {
    console.log('\n🧪 searchMaddeExact Testi');
    console.log('🔍 Arama terimi:', searchTerm);
    console.log('👤 Kullanıcı aktif:', isUserActive ? 'Evet' : 'Hayır');
    
    const options = {
      searchTerm: searchTerm,
      searchDil: 'tumu',
      searchTip: 'tumu',
      searchDict: 'tumu',
      limit: 10,
      page: 1,
      isUserActive: isUserActive,
    };
    
    const result = await searchMaddeExact(options);
    
    console.log(`\n📊 Sonuçlar:`);
    console.log(`   - Toplam: ${result.meta.total}`);
    console.log(`   - Dönen kayıt: ${result.data.length}`);
    console.log(`   - Sayfa: ${result.meta.page}/${result.meta.totalPages}`);
    
    if (result.data.length > 0) {
      console.log(`\n📝 İlk ${Math.min(3, result.data.length)} kayıt:`);
      result.data.slice(0, 3).forEach((item, index) => {
        console.log(`\n   ${index + 1}. ${item.madde}`);
        console.log(`      - Sözlük: ${item.dict.name || 'N/A'}`);
        console.log(`      - Dil: ${item.dict.lang || 'N/A'}`);
        console.log(`      - whichDict ID: ${item.whichDict.id || 'N/A'}`);
        if (isUserActive) {
          console.log(`      - ✅ Tüm whichDict kayıtları gösteriliyor`);
        } else {
          console.log(`      - ⚠️  Sadece ilk whichDict kaydı gösteriliyor`);
        }
      });
      
      // Eğer kullanıcı aktif değilse, kaç tane whichDict kaydı olduğunu kontrol et
      if (!isUserActive && result.data.length > 0) {
        // MongoDB'den gerçek whichDict sayısını kontrol et
        const Madde = require('./src/models/madde.model');
        const firstResult = result.data[0];
        const fullMadde = await Madde.findById(firstResult._id).lean();
        if (fullMadde && fullMadde.whichDict) {
          const totalWhichDict = fullMadde.whichDict.length;
          if (totalWhichDict > 1) {
            console.log(`\n⚠️  UYARI: Bu maddenin ${totalWhichDict} whichDict kaydı var, ama sadece 1 tanesi gösteriliyor!`);
            console.log(`   Kullanıcı aktif olsaydı, ${totalWhichDict} kayıt gösterilecekti.`);
          }
        }
      }
    } else {
      console.log('\n❌ Sonuç bulunamadı');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Arama hatası:', error.message);
    console.error(error.stack);
    return null;
  }
};

// Ana test fonksiyonu
const runTests = async () => {
  console.log('🚀 Test Başlatılıyor...\n');
  
  // MongoDB bağlantısı
  const mongoConnected = await connectMongo();
  if (!mongoConnected) {
    console.error('❌ MongoDB bağlantısı olmadan test devam edemez');
    process.exit(1);
  }
  
  // Elasticsearch bağlantısı
  const esConnected = await testElasticsearch();
  if (!esConnected) {
    console.error('❌ Elasticsearch bağlantısı olmadan test devam edemez');
    await mongoose.disconnect();
    process.exit(1);
  }
  
  // Test parametreleri
  const args = process.argv.slice(2);
  const searchTerm = args.includes('--search') 
    ? args[args.indexOf('--search') + 1] || 'kalem'
    : 'kalem';
  const testIP = args.includes('--ip')
    ? args[args.indexOf('--ip') + 1] || '192.168.1.1'
    : '192.168.1.1';
  
  // Test 1: Kurum kontrolü
  await testKurumsalAccess(testIP);
  
  // Test 2: Arama - Kullanıcı aktif değil
  console.log('\n' + '='.repeat(60));
  await testSearchMaddeExact(searchTerm, false);
  
  // Test 3: Arama - Kullanıcı aktif
  console.log('\n' + '='.repeat(60));
  await testSearchMaddeExact(searchTerm, true);
  
  // Temizlik
  await mongoose.disconnect();
  console.log('\n✅ Test tamamlandı');
  process.exit(0);
};

// Hata yakalama
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Testi çalıştır
runTests();

#!/usr/bin/env node

/**
 * MongoDB to Elasticsearch Sync Script
 * Hızlı bulk transfer için optimize edildi
 * 
 * Usage:
 *   node sync-to-elasticsearch.js           # İlk kez sync (index yoksa oluşturur)
 *   node sync-to-elasticsearch.js --resume  # Kaldığı yerden devam et (index'i silme)
 *   node sync-to-elasticsearch.js --force   # Sıfırdan başla (index'i sil ve yeniden oluştur)
 */

const { Client } = require('@elastic/elasticsearch');
const mongoose = require('mongoose');
const config = require('./src/config/config');
const Madde = require('./src/models/madde.model');

// Elasticsearch client
const esClient = new Client({
  node: 'http://46.235.14.33:9200',
  auth: {
    username: 'elastic',
    password: 'Vd8I39ShIr66KHMBe5O1'
  },
  requestTimeout: 60000,
  maxRetries: 3
});

// Index mapping - Turkish ve Arabic karakterleri destekler
const indexMapping = {
  settings: {
    analysis: {
      analyzer: {
        multilang_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding']
        }
      }
    },
    number_of_shards: 1,
    number_of_replicas: 0  // Sync sırasında replica yok, sonra aktif edilir
  },
  mappings: {
    properties: {
      madde: {
        type: 'text',
        analyzer: 'multilang_analyzer',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          },
          raw: {
            type: 'keyword'
          }
        }
      },
      digeryazim: {
        type: 'text',
        analyzer: 'multilang_analyzer'
      },
      whichDict: {
        type: 'nested',
        properties: {
          id: { type: 'keyword' },
          dictId: { type: 'keyword' },
          lang: { type: 'keyword' },  // Sözlük dili
          code: { type: 'keyword' },  // Sözlük kodu
          name: { type: 'text' },     // Sözlük adı
          anlam: {
            type: 'text',
            analyzer: 'multilang_analyzer'
          },
          tip: { type: 'keyword' },
          tur: { type: 'keyword' }
        }
      },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  }
};

async function createIndex(force = false) {
  try {
    const exists = await esClient.indices.exists({ index: 'maddes' });
    
    if (exists) {
      if (force) {
        console.log('⚠️  Index mevcut, siliniyor...');
        await esClient.indices.delete({ index: 'maddes' });
      } else {
        console.log('✅ Index zaten mevcut, devam ediliyor...');
        return false; // Index zaten var, yeniden oluşturma
      }
    }
    
    // Yeni index oluştur
    await esClient.indices.create({
      index: 'maddes',
      body: indexMapping
    });
    
    console.log('✅ Index oluşturuldu: maddes');
    return true; // Yeni index oluşturuldu
  } catch (error) {
    console.error('❌ Index oluşturma hatası:', error.message);
    throw error;
  }
}

async function syncData(resume = false) {
  try {
    console.log('🔗 MongoDB\'ye bağlanılıyor...');
    // Doğrudan MongoDB URL
    const mongoUrl = 'mongodb://monster:S4n4n3123A@kelime.com:27027/kelimecomdb?authSource=admin';
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB bağlantısı başarılı');
    
    // Elasticsearch'teki mevcut kayıt sayısı
    let existingCount = 0;
    if (resume) {
      const countResult = await esClient.count({ index: 'maddes' });
      existingCount = countResult.count;
      console.log(`📊 Elasticsearch'te mevcut: ${existingCount} kayıt`);
    }
    
    // Toplam kayıt sayısı
    const totalCount = await Madde.countDocuments();
    console.log(`📊 MongoDB'de toplam: ${totalCount} kayıt`);
    
    const batchSize = 2000;  // Batch size - memory optimized
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    const startTime = Date.now();
    
    // Dictionaries koleksiyonunu önce yükle (lang bilgisi için)
    console.log('📚 Dictionaries yükleniyor...');
    const Dictionaries = require('./src/models/dictionaries.model');
    const dicts = await Dictionaries.find().lean();
    const dictMap = new Map();
    dicts.forEach(d => {
      dictMap.set(d._id.toString(), { lang: d.lang, code: d.code, name: d.name });
    });
    console.log(`✅ ${dictMap.size} sözlük yüklendi`);
    
    // Cursor ile stream processing (lean - hızlı!)
    const cursor = Madde.find().lean().cursor({ batchSize: batchSize });
    
    let bulk = [];
    let bulkCount = 0;
    
    for await (const doc of cursor) {
      // Elasticsearch bulk format
      bulk.push({ index: { _index: 'maddes', _id: doc._id.toString() } });
      
      // whichDict için dictionary bilgisini dictMap'ten al
      const whichDictData = (doc.whichDict || []).map(wd => {
        const dictIdStr = wd.dictId ? wd.dictId.toString() : null;
        const dictInfo = dictIdStr ? dictMap.get(dictIdStr) : null;
        
        return {
          id: wd.id ? wd.id.toString() : null,
          dictId: dictIdStr,
          lang: dictInfo?.lang || null,  // dictMap'ten dil bilgisi
          code: dictInfo?.code || null,  // dictMap'ten kod bilgisi
          name: dictInfo?.name || null,  // dictMap'ten sözlük adı
          anlam: wd.anlam || '',
          tip: wd.tip || [],
          tur: wd.tur || []
        };
      });
      
      bulk.push({
        madde: doc.madde,
        digeryazim: doc.digeryazim || [],
        whichDict: whichDictData,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      });
      
      bulkCount++;
      processed++;
      
      // Batch size'a ulaşınca gönder
      if (bulkCount >= batchSize) {
        try {
          const bulkResponse = await esClient.bulk({ 
            body: bulk,
            refresh: false  // Her batch'te refresh yapma (performance)
          });
          
          if (bulkResponse.errors) {
            const errorCount = bulkResponse.items.filter(item => item.index.error).length;
            failed += errorCount;
            successful += (bulkCount - errorCount);
          } else {
            successful += bulkCount;
          }
          
          const progress = ((processed / totalCount) * 100).toFixed(2);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = (processed / elapsed).toFixed(0);
          
          console.log(`📤 [${progress}%] ${processed}/${totalCount} - ${rate} docs/sec - ✅ ${successful} ❌ ${failed}`);
          
        } catch (error) {
          console.error(`❌ Bulk insert hatası: ${error.message}`);
          failed += bulkCount;
        }
        
        // Reset
        bulk = [];
        bulkCount = 0;
      }
    }
    
    // Son batch
    if (bulk.length > 0) {
      try {
        const bulkResponse = await esClient.bulk({ body: bulk, refresh: false });
        
        if (bulkResponse.errors) {
          const errorCount = bulkResponse.items.filter(item => item.index.error).length;
          failed += errorCount;
          successful += (bulkCount - errorCount);
        } else {
          successful += bulkCount;
        }
      } catch (error) {
        console.error(`❌ Son batch hatası: ${error.message}`);
        failed += bulkCount;
      }
    }
    
    // Index'i refresh et
    console.log('🔄 Index refresh ediliyor...');
    await esClient.indices.refresh({ index: 'maddes' });
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgRate = (successful / totalTime).toFixed(0);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Sync tamamlandı!');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successful}`);
    console.log(`❌ Hatalı: ${failed}`);
    console.log(`📊 Toplam: ${processed}`);
    console.log(`⏱️  Süre: ${totalTime} saniye`);
    console.log(`⚡ Ortalama: ${avgRate} docs/sec`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Sync hatası:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

async function main() {
  try {
    // Komut satırı argümanları: --resume (devam et) veya --force (sıfırdan başla)
    const args = process.argv.slice(2);
    const resume = args.includes('--resume');
    const force = args.includes('--force');
    
    console.log('\n' + '='.repeat(60));
    if (resume) {
      console.log('🔄 Elasticsearch Sync Devam Ettiriliyor');
    } else if (force) {
      console.log('🔥 Elasticsearch Sync Sıfırdan Başlatılıyor');
    } else {
      console.log('🚀 Elasticsearch Sync Başlatılıyor');
    }
    console.log('='.repeat(60) + '\n');
    
    // 1. Index oluştur (resume modunda index'i silme)
    await createIndex(force);
    
    // 2. Data sync (resume modunda kaldığı yerden devam)
    await syncData(resume);
    
    // 3. Index settings güncelle (replica aktif et)
    console.log('⚙️  Index settings güncelleniyor...');
    await esClient.indices.putSettings({
      index: 'maddes',
      body: {
        number_of_replicas: 1
      }
    });
    console.log('✅ Replica aktif edildi');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();


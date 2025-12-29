const { Client } = require('@elastic/elasticsearch');
const config = require('../config/config');
const logger = require('../config/logger');
const { normalizeSearchTermForElasticsearch } = require('../utils/searchNormalization');

// Elasticsearch client
const esClient = new Client({
  node: config.elasticsearch.url,
  auth: config.elasticsearch.auth
    ? {
        username: config.elasticsearch.auth.username,
        password: config.elasticsearch.auth.password,
      }
    : undefined,
  requestTimeout: 30000,
  maxRetries: 3,
});

/**
 * İlk sorgu için hızlı arama
 * MongoDB regex yerine Elasticsearch prefix search
 */
const searchMaddeIlksorgu = async (options) => {
  const startTime = Date.now();
  
  const {
    searchTerm,
    searchDil,
    searchTip,
    searchDict,
    filterOrders,
    limit = 7,
    page = 1,
  } = options;
  
  logger.info(`🔍 [ES] İlksorgu başlatıldı: "${searchTerm}"`);
  
  const from = (page - 1) * limit;
  
  // Build query
  const must = [];
  const filter = [];
  
  // Normalize edilmiş arama terimleri (ör: "kelam" -> ["kelam", "kelâm"])
  const normalizedTerms = normalizeSearchTermForElasticsearch(searchTerm);
  logger.info(`🔍 [ES] Normalize edilmiş terimler: ${JSON.stringify(normalizedTerms)}`);
  
  // Ana arama - prefix match (hızlı!)
  // Hem orijinal hem normalize edilmiş varyasyonlarla arama yap
  const prefixQueries = normalizedTerms.map(term => ({
    prefix: {
      madde: {
        value: term.toLowerCase(),
      },
    },
  }));
  
  const keywordQueries = normalizedTerms.map(term => ({
    prefix: {
      'madde.keyword': {
        value: term.toLowerCase(),
        case_insensitive: true,
      },
    },
  }));
  
  must.push({
    bool: {
      should: [...prefixQueries, ...keywordQueries],
      minimum_should_match: 1,
    },
  });
  
  // NOT: Filtreleri şimdilik devre dışı bırakıyoruz
  // İlk aşamada sadece hız testi yapıyoruz
  // Daha sonra nested query'leri düzgün ekleyeceğiz
  
  // // Dil filtresi
  // if (searchDil && searchDil !== 'tumu' && searchDil !== 'undefined') {
  //   filter.push({
  //     nested: {
  //       path: 'whichDict',
  //       query: {
  //         term: { 'whichDict.lang': searchDil },
  //       },
  //     },
  //   });
  // }
  
  logger.info(`🔍 [ES] Filters disabled for initial testing`);
  
  // Dil sıralama önceliği
  const langOrder = (filterOrders || 'en,os,fa,tr,ar,fr').split(',');
  
  // Elasticsearch sorgusu
  try {
    const result = await esClient.search({
      index: 'maddes',
      body: {
        from,
        size: limit,
        query: {
          bool: {
            must,
            filter,
          },
        },
        sort: [
          { 'madde.keyword': 'asc' }, // Alfabetik sıralama
        ],
        _source: ['madde', 'digeryazim', 'whichDict', 'anlam', 'createdAt', 'updatedAt'],
      },
    });
    
    const duration = Date.now() - startTime;
    
    logger.info(`✅ [ES] İlksorgu tamamlandı`);
    logger.info(`⏱️  [ES] Süre: ${duration}ms`);
    logger.info(`📈 [ES] Sonuç: ${result.hits.hits.length} / ${result.hits.total.value}`);
    
    // MongoDB formatına dönüştür
    const docs = result.hits.hits.map((hit) => {
      const firstDict = hit._source.whichDict?.[0] || {};
      
      return {
        _id: hit._id,
        madde: hit._source.madde,
        digeryazim: hit._source.digeryazim || [],
        whichDict: hit._source.whichDict || [],
        anlam: hit._source.anlam || '',
        maddeId: hit._id,
        // Dil sıralama önceliğine göre ilk sözlüğü bul
        lang: firstDict.lang || 'tr',
        tip: firstDict.tip?.[0] || '',
        maddeLength: hit._source.madde?.length || 0,
      };
    });
    
    // Frontend'in beklediği format: { data, meta }
    return {
      data: docs,
      meta: {
        total: result.hits.total.value,
        page,
        limit,
        totalPages: Math.ceil(result.hits.total.value / limit),
        pagingCounter: from + 1,
        hasPrevPage: page > 1,
        hasNextPage: from + limit < result.hits.total.value,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: from + limit < result.hits.total.value ? page + 1 : null,
      }
    };
  } catch (error) {
    logger.error(`❌ [ES] Sorgu hatası: ${error.message}`);
    throw error;
  }
};

/**
 * Kelimeye göre arama (detaylı)
 */
const searchMaddeByTerm = async (options) => {
  const startTime = Date.now();
  
  const {
    searchTerm,
    searchDil,
    searchTip,
    searchDict,
    limit = 10,
    page = 1,
  } = options;
  
  logger.info(`🔍 [ES] Kelime araması: "${searchTerm}"`);
  
  const from = (page - 1) * limit;
  
  const must = [];
  const filter = [];
  
  // Normalize edilmiş arama terimleri
  const normalizedTerms = normalizeSearchTermForElasticsearch(searchTerm);
  logger.info(`🔍 [ES] Normalize edilmiş terimler: ${JSON.stringify(normalizedTerms)}`);
  
  // Multi-match query (fuzzy + prefix) - her normalize edilmiş terim için
  const multiMatchQueries = normalizedTerms.map(term => ({
    multi_match: {
      query: term,
      fields: ['madde^3', 'madde.keyword^2', 'digeryazim'],
      type: 'best_fields',
      fuzziness: 'AUTO',
      prefix_length: 2,
    },
  }));
  
  must.push({
    bool: {
      should: multiMatchQueries,
      minimum_should_match: 1,
    },
  });
  
  // Filters
  if (searchDil && searchDil !== 'tumu' && searchDil !== 'undefined') {
    filter.push({
      nested: {
        path: 'whichDict',
        query: { term: { 'whichDict.lang': searchDil } },
      },
    });
  }
  
  try {
    const result = await esClient.search({
      index: 'maddes',
      body: {
        from,
        size: limit,
        query: {
          bool: { must, filter },
        },
        sort: [
          { '_score': 'desc' },
          { 'madde.keyword': 'asc' },
        ],
      },
    });
    
    const duration = Date.now() - startTime;
    
    logger.info(`✅ [ES] Arama tamamlandı - ${duration}ms`);
    
    const docs = result.hits.hits.map((hit) => ({
      _id: hit._id,
      ...hit._source,
      maddeId: hit._id,
    }));
    
    // Frontend'in beklediği format: { data, meta }
    return {
      data: docs,
      meta: {
        total: result.hits.total.value,
        page,
        limit,
        totalPages: Math.ceil(result.hits.total.value / limit),
        pagingCounter: from + 1,
        hasPrevPage: page > 1,
        hasNextPage: from + limit < result.hits.total.value,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: from + limit < result.hits.total.value ? page + 1 : null,
      }
    };
  } catch (error) {
    logger.error(`❌ [ES] Arama hatası: ${error.message}`);
    throw error;
  }
};

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    const health = await esClient.cluster.health();
    return {
      status: health.status,
      numberOfNodes: health.number_of_nodes,
      activeShards: health.active_shards,
    };
  } catch (error) {
    logger.error(`❌ [ES] Health check hatası: ${error.message}`);
    return { status: 'unavailable', error: error.message };
  }
};

module.exports = {
  searchMaddeIlksorgu,
  /**
   * Exact arama: madde tam eşleşme + isteğe bağlı filtreler
   */
  searchMaddeExact: async (options) => {
    const { searchTerm, searchDil, searchTip, searchDict, limit = 10, page = 1, isUserActive = false } = options;
    const from = (page - 1) * limit;

    const filter = [];
    if (searchDil && searchDil !== 'tumu' && searchDil !== 'undefined') {
      filter.push({
        nested: {
          path: 'whichDict',
          query: { term: { 'whichDict.lang': searchDil } },
        },
      });
    }
    if (searchTip && searchTip !== 'tumu' && searchTip !== 'undefined') {
      filter.push({
        nested: {
          path: 'whichDict',
          query: { term: { 'whichDict.tip': searchTip } },
        },
      });
    }
    if (searchDict && searchDict !== 'tumu' && searchDict !== 'undefined') {
      filter.push({
        nested: {
          path: 'whichDict',
          query: { term: { 'whichDict.code': searchDict } },
        },
      });
    }

    // Normalize edilmiş arama terimleri
    const normalizedTerms = normalizeSearchTermForElasticsearch(searchTerm);
    logger.info(`🔍 [ES Exact] Normalize edilmiş terimler: ${JSON.stringify(normalizedTerms)}`);
    
    // Her normalize edilmiş terim için exact match sorguları
    const termQueries = normalizedTerms.flatMap(term => [
      { term: { 'madde.keyword': { value: term, case_insensitive: true } } },
      { term: { 'digeryazim.keyword': { value: term, case_insensitive: true } } },
    ]);

    const body = {
      from,
      size: limit,
      query: {
        bool: {
          must: [
            {
              bool: {
                should: termQueries,
                minimum_should_match: 1,
              },
            },
          ],
          filter,
        },
      },
      _source: ['madde', 'digeryazim', 'whichDict', 'createdAt', 'updatedAt'],
    };

    const result = await esClient.search({ index: 'maddes', body });

    // Eğer kullanıcı aktifse (isUserActive = true), tüm whichDict kayıtlarını döndür
    // Değilse sadece ilk kaydı döndür
    const docs = result.hits.hits.map((hit) => {
      if (isUserActive && hit._source.whichDict && hit._source.whichDict.length > 0) {
        // Kullanıcı aktifse, her whichDict kaydı için ayrı bir doküman oluştur
        return hit._source.whichDict.map((whichDictItem) => ({
          _id: hit._id,
          madde: hit._source.madde,
          digeryazim: hit._source.digeryazim || [],
          whichDict: whichDictItem,
          dict: {
            _id: whichDictItem.dictId || null,
            lang: whichDictItem.lang || null,
            code: whichDictItem.code || null,
            name: whichDictItem.name || null,
          },
        }));
      } else {
        // Kullanıcı aktif değilse, sadece ilk kaydı döndür
        const selected = (hit._source.whichDict && hit._source.whichDict[0]) || {};
        return {
          _id: hit._id,
          madde: hit._source.madde,
          digeryazim: hit._source.digeryazim || [],
          whichDict: selected,
          dict: {
            _id: selected.dictId || null,
            lang: selected.lang || null,
            code: selected.code || null,
            name: selected.name || null,
          },
        };
      }
    });

    // Flatten array (eğer isUserActive true ise nested array olabilir)
    const flattenedDocs = docs.flat();

    return {
      data: flattenedDocs,
      meta: {
        total: result.hits.total.value,
        page,
        limit,
        totalPages: Math.ceil(result.hits.total.value / limit),
        hasMoreResults: isUserActive ? false : (flattenedDocs.length < result.hits.total.value),
      },
    };
  },

  /**
   * Anlam araması: whichDict.anlam üzerinde nested search
   */
  searchMaddeAnlam: async (options) => {
    const { searchTerm, searchDil, searchTip, searchDict, limit = 10, page = 1 } = options;
    const from = (page - 1) * limit;

    const nestedFilters = [];
    if (searchDil && searchDil !== 'tumu' && searchDil !== 'undefined') nestedFilters.push({ term: { 'whichDict.lang': searchDil } });
    if (searchTip && searchTip !== 'tumu' && searchTip !== 'undefined') nestedFilters.push({ term: { 'whichDict.tip': searchTip } });
    if (searchDict && searchDict !== 'tumu' && searchDict !== 'undefined') nestedFilters.push({ term: { 'whichDict.code': searchDict } });

    // Normalize edilmiş arama terimleri
    const normalizedTerms = normalizeSearchTermForElasticsearch(searchTerm);
    logger.info(`🔍 [ES Anlam] Normalize edilmiş terimler: ${JSON.stringify(normalizedTerms)}`);
    
    // Her normalize edilmiş terim için match sorguları
    const matchQueries = normalizedTerms.map(term => ({
      match: { 'whichDict.anlam': { query: term, operator: 'and' } },
    }));

    const body = {
      from,
      size: limit,
      query: {
        nested: {
          path: 'whichDict',
          query: {
            bool: {
              must: [
                {
                  bool: {
                    should: matchQueries,
                    minimum_should_match: 1,
                  },
                },
              ],
              filter: nestedFilters,
            },
          },
          inner_hits: { size: 1 },
        },
      },
      _source: ['madde', 'digeryazim', 'whichDict', 'createdAt', 'updatedAt'],
    };

    const result = await esClient.search({ index: 'maddes', body });

    const docs = result.hits.hits.map((hit) => {
      const ih = hit.inner_hits && hit.inner_hits.whichDict && hit.inner_hits.whichDict.hits.hits[0];
      const selected = ih ? ih._source : ((hit._source.whichDict && hit._source.whichDict[0]) || {});
      return {
        _id: hit._id,
        madde: hit._source.madde,
        whichDict: selected,
        dict: {
          _id: selected.dictId || null,
          lang: selected.lang || null,
          code: selected.code || null,
          name: selected.name || null,
        },
      };
    });

    return {
      data: docs,
      meta: {
        total: result.hits.total.value,
        page,
        limit,
        totalPages: Math.ceil(result.hits.total.value / limit),
      },
    };
  },
  /**
   * exactwithdash: prefix + contains araması (Mongo eşleniği)
   */
  searchMaddeExactWithDash: async (options) => {
    const { searchTerm, searchDil, searchTip, searchDict, limit = 10, page = 1 } = options;
    const from = (page - 1) * limit;

    const filter = [];
    if (searchDil && searchDil !== 'tumu' && searchDil !== 'undefined') {
      filter.push({ nested: { path: 'whichDict', query: { term: { 'whichDict.lang': searchDil } } } });
    }
    if (searchTip && searchTip !== 'tumu' && searchTip !== 'undefined') {
      filter.push({ nested: { path: 'whichDict', query: { term: { 'whichDict.tip': searchTip } } } });
    }
    if (searchDict && searchDict !== 'tumu' && searchDict !== 'undefined') {
      filter.push({ nested: { path: 'whichDict', query: { term: { 'whichDict.code': searchDict } } } });
    }

    // Normalize edilmiş arama terimleri
    const normalizedTerms = normalizeSearchTermForElasticsearch(searchTerm);
    logger.info(`🔍 [ES ExactWithDash] Normalize edilmiş terimler: ${JSON.stringify(normalizedTerms)}`);
    
    // Her normalize edilmiş terim için prefix ve match_phrase sorguları
    const shouldQueries = normalizedTerms.flatMap(term => [
      { prefix: { madde: term.toLowerCase() } },
      { match_phrase: { madde: { query: term, slop: 0 } } },
    ]);

    const body = {
      from,
      size: limit,
      query: {
        bool: {
          should: shouldQueries,
          minimum_should_match: 1,
          filter,
        },
      },
      sort: [{ 'madde.keyword': 'asc' }],
      _source: ['madde', 'digeryazim', 'whichDict', 'createdAt', 'updatedAt'],
    };

    const result = await esClient.search({ index: 'maddes', body });

    const docs = result.hits.hits.map((hit) => {
      const selected = (hit._source.whichDict && hit._source.whichDict[0]) || {};
      return {
        _id: hit._id,
        madde: hit._source.madde,
        digeryazim: hit._source.digeryazim || [],
        whichDict: selected,
        dict: {
          _id: selected.dictId || null,
          lang: selected.lang || null,
          code: selected.code || null,
          name: selected.name || null,
        },
      };
    });

    return {
      data: docs,
      meta: {
        total: result.hits.total.value,
        page,
        limit,
        totalPages: Math.ceil(result.hits.total.value / limit),
      },
    };
  },
  searchMaddeByTerm,
  healthCheck,
  esClient,
};


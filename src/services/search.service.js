/* eslint-disable no-restricted-syntax */
/* eslint-disable security/detect-unsafe-regex */
/* eslint-disable security/detect-non-literal-regexp */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Madde } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { normalizeSearchTerm } = require('../utils/searchNormalization');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;

// Elasticsearch service (lazy load to avoid circular dependency)
let elasticsearchService = null;
const getElasticsearchService = () => {
  if (!elasticsearchService) {
    elasticsearchService = require('./elasticsearch.service');
  }
  return elasticsearchService;
};

/**
 * Create a packet
 * @param {Object} packetBody
 * @returns {Promise<Packets>}
 */
const createKelimeler = async (maddeBody) => {
  if (await Madde.isMaddeAlrearyInDB(maddeBody.madde)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten tanımlı');
  }
  const madde = await Madde.create(maddeBody);
  return madde;
};

const queryKelimeler = async (filter, options) => {
  const maddeler = await Madde.paginate(filter, options);
  return maddeler;
};

const updateDigeryazim = async () => {
  const cursor = Madde.find({}).cursor();
  let icount = 0;
  let ecount = 0;
  const erormessages = [];
  // eslint-disable-next-line no-await-in-loop
  // for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  for await (const doc of cursor) {
    const maddemiz = doc.madde;
    const docdigeryazim = doc.digeryazim;

    // eslint-disable-next-line no-console
    // console.log('madde:', maddemiz, docdigeryazim.toString());
    const temp = [...docdigeryazim];
    const yeni = [];
    const kesmeRegex = new RegExp("[’'`‘]", 'g');
    const tireRegex = new RegExp('[-]', 'g');

    // // eslint-disable-next-line no-console
    // console.log(JSON.stringify('kesme varmı:', kesmeRegex.test(maddemiz)));
    // // eslint-disable-next-line no-console
    // console.log(JSON.stringify('tire varmı:', kesmeRegex.test(maddemiz)));

    if (kesmeRegex.test(maddemiz)) {
      const yenikesmeli = maddemiz.replace(kesmeRegex, '');
      yeni.push(yenikesmeli);
      if (tireRegex.test(yenikesmeli)) {
        yeni.push(yenikesmeli.replace(tireRegex, ''));
        yeni.push(yenikesmeli.replace(tireRegex, ' '));
      }
    }

    if (tireRegex.test(maddemiz)) {
      yeni.push(maddemiz.replace(tireRegex, ''));
      yeni.push(maddemiz.replace(tireRegex, ' '));
    }

    if (yeni && yeni.length > 0) {
      let final = [...temp, ...yeni];
      final = [...new Set(final)];
      // eslint-disable-next-line no-console
      // console.log(JSON.stringify(final));
      doc.set('digeryazim', final);
      // eslint-disable-next-line no-loop-func
      doc.save(function (err) {
        if (err) {
          ecount += 1;
          // eslint-disable-next-line no-console
          erormessages.push({ err, maddemiz });
        } else {
          // eslint-disable-next-line no-console
          console.log('saved ', maddemiz, final.toString());
        }
      });
      icount += 1;
      // eslint-disable-next-line no-console
      // console.log(doc.madde, ' : ', JSON.stringify(final, null, 2)); // Prints documents one at a time
    }
  }

  return { updated: icount, error: ecount, errormessages: erormessages };
};

const rawQueryKelimeler = async (options) => {
  const { searchType, searchFilter } = options;
  
  // ⚡ PERFORMANCE: Use Elasticsearch for ilksorgu (first search)
  if (searchType === 'ilksorgu') {
    try {
      const es = getElasticsearchService();
      
      const esOptions = {
        searchTerm: decodeURIComponent(options.searchTerm),
        searchDil: searchFilter?.dil,
        searchTip: searchFilter?.tip,
        searchDict: searchFilter?.sozluk,
        filterOrders: searchFilter?.filterOrders,
        limit: options.limit || 7,
        page: options.page || 1,
      };
      
      logger.info(`🚀 [SEARCH] Using Elasticsearch for ilksorgu: "${esOptions.searchTerm}"`);
      
      const result = await es.searchMaddeIlksorgu(esOptions);
      
      logger.info(`✅ [SEARCH] Elasticsearch returned ${result.docs?.length || 0} results`);
      
      return result;
    } catch (esError) {
      logger.error(`❌ [SEARCH] Elasticsearch error, falling back to MongoDB: ${esError.message}`);
      // Fallback to MongoDB on error
    }
  }
  
  // Elasticsearch implementations for other search types
  if (searchType === 'exact') {
    try {
      const es = getElasticsearchService();
      const esOptions = {
        searchTerm: decodeURIComponent(options.searchTerm),
        searchDil: searchFilter?.dil,
        searchTip: searchFilter?.tip,
        searchDict: searchFilter?.sozluk,
        limit: options.limit || 10,
        page: options.page || 1,
        isUserActive: options.isUserActive || false, // Kullanıcı aktifse tüm whichDict kayıtlarını getir
      };
      const result = await es.searchMaddeExact(esOptions);
      return result;
    } catch (e) {
      logger.error(`[ES exact] fallback to Mongo: ${e.message}`);
    }
  }

  if (searchType === 'maddeanlam') {
    try {
      const es = getElasticsearchService();
      const esOptions = {
        searchTerm: decodeURIComponent(options.searchTerm),
        searchDil: searchFilter?.dil,
        searchTip: searchFilter?.tip,
        searchDict: searchFilter?.sozluk,
        limit: options.limit || 10,
        page: options.page || 1,
      };
      const result = await es.searchMaddeAnlam(esOptions);
      return result;
    } catch (e) {
      logger.error(`[ES maddeanlam] fallback to Mongo: ${e.message}`);
    }
  }

  if (searchType === 'exactwithdash') {
    try {
      const es = getElasticsearchService();
      const esOptions = {
        searchTerm: decodeURIComponent(options.searchTerm),
        searchDil: searchFilter?.dil,
        searchTip: searchFilter?.tip,
        searchDict: searchFilter?.sozluk,
        limit: options.limit || 10,
        page: options.page || 1,
      };
      const result = await es.searchMaddeExactWithDash(esOptions);
      return result;
    } catch (e) {
      logger.error(`[ES exactwithdash] fallback to Mongo: ${e.message}`);
    }
  }

  // MongoDB fallback
  const conditionalMatch = {};
  const conditionalMatch2 = {};
  const conditionalMatch3 = {};
  let { searchTerm } = options;
  searchTerm = decodeURIComponent(searchTerm);

  let hiddenTur = '';
  if (searchTerm.includes('_')) {
    [searchTerm, hiddenTur] = searchTerm.split('_');
    // eslint-disable-next-line no-console
    // console.log('HİDDEN _ var:', searchTerm, hiddenTur);
  }
  const langOrders = [];
  const defaultLangOrders = ['tr', 'en', 'os', 'ar', 'fa'];
  // eslint-disable-next-line no-console
  // ('search service-->:', options);
  // eslint-disable-next-line no-console
  
  // Normalizasyon: Türkçe ve Arapça karakterler için pattern oluştur
  searchTerm = normalizeSearchTerm(searchTerm);

  if (searchType === 'exact') {
    if (['?', '*', '[', ']', '(', ')', '.'].some((char) => searchTerm.includes(char))) {
      conditionalMatch.$or = [
        {
          madde: {
            $regex: new RegExp(`^${searchTerm}$`, 'i'),
          },
        },
        {
          digeryazim: { $in: [new RegExp(`^${searchTerm}$`, 'i')] },
        },
      ];
    } else {
      conditionalMatch.$or = [
        {
          madde: {
            $regex: new RegExp(`^${searchTerm}$`, 'i'),
          },
        },
        {
          digeryazim: { $in: [new RegExp(`^${searchTerm}$`, 'i')] },
        },
        // {
        //   madde: searchTerm,
        // },
        // {
        //   digeryazim: { $in: [searchTerm] },
        // },
      ];
      // conditionalMatch.madde = searchTerm;
    }
    // console.log('searchTerm:ddddd:', searchTerm);
  } else if (searchType === 'exactwithdash') {
    // Optimized regex queries with better performance
    conditionalMatch.$or = [
      {
        madde: {
          $regex: new RegExp(`^${searchTerm}`, 'i'),
        },
      },
      {
        madde: {
          $regex: new RegExp(`${searchTerm}`, 'i'),
        },
      },
    ];
  } else if (searchType === 'maddeanlam') {
    // Optimized regex query for anlam field
    conditionalMatch['whichDict.anlam'] = {
      $regex: new RegExp(`${searchTerm}`, 'i'),
    };
  } else if (searchType === 'advanced' && !['?', '*', '[', ']', '(', ')', '.'].some((char) => searchTerm.includes(char))) {
    conditionalMatch.madde = searchTerm;
  } else if (searchType === 'advanced' && ['?', '*', '[', ']', '(', ')', '.'].some((char) => searchTerm.includes(char))) {
    conditionalMatch.madde = {
      $regex: new RegExp(`^${searchTerm}$`, 'i'),
    };
  } else {
    // if (!searchTermConverted.includes("'") && searchTermConverted.includes('`')) {
    //   searchTermConverted = searchTermConverted.replace(/`/g, "['`]");
    // }
    // if (!searchTermConverted.includes('[- ]') && searchTermConverted.includes(' ')) {
    //   searchTermConverted = searchTermConverted.replace(/ /g, '[- ]');
    // }
    // eslint-disable-next-line no-console
    console.log('ILKSORUGUUUUUU DA BURDA');
    console.log('🔍 Original searchTerm:', searchTerm);
    
    // ⚡ PERFORMANCE FIX: Use MongoDB text search (uses text index!)
    // This is MUCH faster than regex for full-text search
    const simplePattern = searchTerm
      .replace(/\[aâ\]/g, 'a')
      .replace(/\[iîı\]/g, 'i')
      .replace(/\[uûü\]/g, 'u')
      .replace(/\[oôö\]/g, 'o')
      .toLowerCase();
    
    console.log('🔍 Simplified pattern:', simplePattern);
    
    // Use MongoDB text search (leverages text index)
    conditionalMatch.$text = {
      $search: simplePattern,
      $caseSensitive: false,
      $diacriticSensitive: false  // Handles â, ş, etc.
    };
    
    // 💡 TODO: Consider Elasticsearch for production
    // - Full-text search optimized
    // - Turkish/Arabic/Persian analyzers
    // - Fuzzy matching, typo tolerance
    // - Sub-100ms response times
  }
  if (hiddenTur) {
    conditionalMatch2['whichDict.tur'] = { $in: [hiddenTur] };
  }
  if (searchFilter) {
    if (searchFilter.dil && searchFilter.dil !== 'tumu' && searchFilter.dil !== 'undefined') {
      conditionalMatch2['dict.lang'] = searchFilter.dil;
    }

    if (searchFilter.tip && searchFilter.tip !== 'tumu' && searchFilter.tip !== 'undefined') {
      conditionalMatch2['whichDict.tip'] = { $in: [searchFilter.tip] };
    }

    if (searchFilter.sozluk && searchFilter.sozluk !== 'tumu' && searchFilter.sozluk !== 'undefined') {
      conditionalMatch2['dict.code'] = { $regex: new RegExp(`^${searchFilter.sozluk}$`, 'i') };
    }

    if (searchFilter.filterOrders) {
      const f = searchFilter.filterOrders.split(',');
      f.forEach((dil, index) => {
        langOrders.push({ case: { $eq: ['$dict.lang', dil] }, then: index });
      });
    } else {
      defaultLangOrders.forEach((dil, index) => {
        langOrders.push({ case: { $eq: ['$dict.lang', dil] }, then: index });
      });
    }
  } else {
    defaultLangOrders.forEach((dil, index) => {
      langOrders.push({ case: { $eq: ['$dict.lang', dil] }, then: index });
    });
  }
  // let kelimeuzunlugu = searchTerm.length;

  // if (['*'].some((char) => searchTerm.includes(char))) {
  //   // eslint-disable-next-line no-invalid-regexp
  //   const xcount = searchTerm.match(/([*])/g);
  //   // eslint-disable-next-line no-console
  //   // console.log('xcount', xcount, xcount.length);
  //   if (xcount) {
  //     kelimeuzunlugu -= xcount.length * 2;
  //   }
  // }
  // if (['(', ')'].some((char) => searchTerm.includes(char))) {
  //   const orcount = searchTerm.match(/(\([\u0020-\u0FFF|]+\))/g);
  //   // eslint-disable-next-line no-console
  //   if (orcount && orcount[0]) {
  //     kelimeuzunlugu -= orcount[0].length - 1;
  //   }
  // }
  // eslint-disable-next-line no-console
  // console.log('kelimeuzun:', kelimeuzunlugu);
  // conditionalMatch3.maddeLength = { $gte: kelimeuzunlugu };

  const groupCond = {
    $group: {
      _id: '$dict.lang',

      madde: {
        $addToSet: '$madde',
      },
      tip: {
        $first: {
          $reduce: {
            input: '$whichDict.tip',
            initialValue: '',
            in: {
              $concat: ['$$value', '$$this'],
            },
          },
        },
      },
      langOrder: {
        $addToSet: '$langOrder',
      },
      tempId: {
        $addToSet: {
          k: '$$ROOT.madde',
          v: '$$ROOT._id',
        },
      },
    },
  };
  const groupExtra = [
    {
      $addFields: {
        mid: {
          $filter: {
            input: '$tempId',
            as: 'y',
            cond: {
              $eq: ['$$y.k', '$madde'],
            },
          },
        },
      },
    },
    {
      $unwind: {
        path: '$mid',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        maddeId: {
          $toString: '$mid.v',
        },
      },
    },
    {
      $unset: ['tempId', 'mid'],
    },
  ];
  let condition = null;

  if (searchType === 'maddeanlam') {
    condition = [
      {
        $unwind: {
          path: '$whichDict',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: conditionalMatch,
      },
      {
        $lookup: {
          from: 'dictionaries',
          localField: 'whichDict.dictId',
          foreignField: '_id',
          as: 'dict',
        },
      },
      {
        $unwind: {
          path: '$dict',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $lookup: {
      //     from: 'maddes',
      //     localField: 'whichDict.karsiMaddeId',
      //     foreignField: '_id',
      //     as: 'karsi',
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'maddes',
      //     localField: 'whichDict.digerMaddeId',
      //     foreignField: '_id',
      //     as: 'diger',
      //   },
      // },
      {
        $match: conditionalMatch2,
      },
    ];
  } else {
    condition = [
      {
        $match: conditionalMatch,
      },
      {
        $unwind: {
          path: '$whichDict',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'dictionaries',
          localField: 'whichDict.dictId',
          foreignField: '_id',
          as: 'dict',
        },
      },
      {
        $unwind: {
          path: '$dict',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    
    // ⚠️ PERFORMANCE: Skip expensive karsi lookup for ilksorgu
    if (searchType !== 'ilksorgu') {
      condition.push({
        $lookup: {
          from: 'maddes',
          localField: 'whichDict.karsi',
          foreignField: '_id',
          as: 'karsi',
        },
      });
    }
    
    // Only add match if there are actual conditions
    if (Object.keys(conditionalMatch2).length > 0) {
      condition.push({
        $match: conditionalMatch2,
      });
    }
  }

  if (searchType === 'advanced') {
    condition.push(
      {
        $addFields: {
          langOrder: {
            $switch: {
              branches: langOrders,
            },
          },
        },
      },
      // {
      //   $unwind: {
      //     path: '$karsi',
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $addFields: {
          maddeLength: { $strLenCP: '$madde' },
          karsimadde: '$whichDict.karsi',
          lang: '$dict.lang',
        },
      },
      {
        $group: {
          _id: '$_id',
          madde: { $first: '$madde' },
          karsimadde: { $first: '$karsimadde' },
          lang: { $first: '$lang' },
          langOrder: { $first: '$langOrder' },
          maddeLength: { $first: '$maddeLength' },
        },
      }
    );
  } else if (searchType === 'ilksorgu') {
    // ⚡ PERFORMANCE: Simplified pipeline for ilksorgu (first search)
    // Instead of complex grouping, just add langOrder and sort
    condition.push({
      $addFields: {
        langOrder: {
          $switch: {
            branches: langOrders,
            default: 999,  // Unknown languages go last
          },
        },
        maddeLength: { $strLenCP: '$madde' },
        maddeId: { $toString: '$_id' },
      },
    });
    
    // Simple project to flatten the structure
    condition.push({
      $project: {
        _id: 1,
        madde: 1,
        maddeId: '$maddeId',
        maddeLength: 1,
        langOrder: 1,
        lang: '$dict.lang',
        dictId: '$dict._id',
        dictName: '$dict.name',
        dictCode: '$dict.code',
      }
    });
  } else {
    condition.push({
      $addFields: {
        maddeLength: { $strLenCP: '$madde' },
        langOrder: {
          $switch: {
            branches: langOrders,
          },
        },
      },
    });
  }

  // Only add match if there are actual conditions
  if (conditionalMatch3 && Object.keys(conditionalMatch3).length > 0) {
    condition.push({
      $match: conditionalMatch3,
    });
  }

  // condition.push({ allowDiskUse: true });
  logger.info(`searchType: ${searchType}`);
  
  // Convert RegExp to string for proper logging
  const conditionForLog = condition.map(stage => {
    const stageCopy = JSON.parse(JSON.stringify(stage, (key, value) => {
      if (value instanceof RegExp) {
        return value.toString();
      }
      return value;
    }));
    return stageCopy;
  });
  logger.info(`final condition:${JSON.stringify(conditionForLog)}`);

  const agg = Madde.aggregate(condition).allowDiskUse(true);

  const suboptions = {
    sort: { maddeLength: 1, langOrder: 1 },
    limit: options.limit,
    page: options.page || 1,
    searchType,
  };
  if (searchType === 'exact') {
    suboptions.limit = 10000;
  }

  // eslint-disable-next-line no-console
  // console.log('-> suboptions:', suboptions);
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      // console.log('ERROR_____>:', err);
      return err;
    }
    return results;
  });
  
  // 🧪 DEBUG: Log result count
  logger.info(`✅ Query completed - Result count: ${maddeler?.docs?.length || 0} / Total: ${maddeler?.totalDocs || 0}`);
  
  return maddeler;
};

const getKelimeById = async (id, dictId) => {
  // eslint-disable-next-line no-console
  let sonuc = null;
  if (dictId) {
    sonuc = await Madde.find({
      $or: [
        { _id: ObjectId(id), whichDict: { $elemMatch: { dictId: ObjectId(dictId) } } },
        // { karsiMaddeId: ObjectId(id), whichDict: { $elemMatch: { dictId: ObjectId(dictId) } } },
      ],
    });
  } else {
    sonuc = await Madde.findById(id);
  }
  // eslint-disable-next-line no-console
  return sonuc;
  // const agg = await Madde.aggregate([
  //   {
  //     $match: { _id: ObjectId(id) },
  //   },
  //   {
  //     $lookup: {
  //       from: 'maddes',
  //       localField: '_id',
  //       foreignField: 'digerMaddeId',
  //       as: 'diger',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'maddes',
  //       localField: '_id',
  //       foreignField: 'karsiMaddeId',
  //       as: 'karsi',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$whichDict',
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'dictionaries',
  //       localField: 'whichDict.dictId',
  //       foreignField: '_id',
  //       as: 'dict',
  //     },
  //   },
  //   {
  //     $unwind: {
  //       path: '$dict',
  //     },
  //   },
  //   {
  //     $addFields: {
  //       'maddeLength': { $strLenCP: '$madde' },
  //     },
  //   },
  // ]);
  // // eslint-disable-next-line no-console
  // console.log('madde:', agg);
  // return agg;
};

const getKelimeByMadde = async (options) => {
  const startTime = Date.now();
  console.log(`🔍 [SEARCH-SERVICE] getKelimeByMadde started`);
  console.log(`📊 Options:`, JSON.stringify(options, null, 2));
  
  // Cache kontrolü (sadece ilksorgu ve advanced için)
  if (options.searchType === 'ilksorgu' || options.searchType === 'advanced') {
    try {
      const cacheService = require('./cache.service');
      const cacheKey = cacheService.generateKey('search', {
        searchTerm: options.searchTerm,
        searchType: options.searchType,
        searchFilter: options.searchFilter,
        limit: options.limit,
        page: options.page
      });
      
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        console.log(`💾 [SEARCH-SERVICE] Cache hit for: ${options.searchTerm}`);
        return cached;
      }
    } catch (cacheError) {
      console.log('⚠️ [SEARCH-SERVICE] Cache error, continuing without cache:', cacheError.message);
    }
  }
  
  const conditionalMatch = {};

  // ⚠️ FIX: Add empty string check and use exact match instead of case-insensitive for better performance
  if (options.searchTip && options.searchTip !== 'tumu' && options.searchTip !== 'undefined' && options.searchTip !== '') {
    conditionalMatch['whichDict.tip'] = { $in: [options.searchTip] };
    console.log(`🔍 Adding whichDict.tip filter: ${options.searchTip}`);
  }

  if (options.searchDil && options.searchDil !== 'tumu' && options.searchDil !== 'undefined' && options.searchDil !== '') {
    // Use exact match for better performance
    conditionalMatch['dict.lang'] = { $regex: new RegExp(`^${options.searchDil}$`, 'i') };
    console.log(`🔍 Adding dict.lang filter: ${options.searchDil}`);
  }

  if (options.searchDict && options.searchDict !== 'tumu' && options.searchDict !== 'undefined' && options.searchDict !== '') {
    // Use exact match for better performance
    conditionalMatch['dict.code'] = { $regex: new RegExp(`^${options.searchDict}$`, 'i') };
    console.log(`🔍 Adding dict.code filter: ${options.searchDict}`);
  }

  const aggArray = [];

  if (options.searchType === 'random') {
    aggArray.push(
      {
        $skip: options.skip,
      },
      {
        $limit: 1,
      },
      {
        $unwind: {
          path: '$whichDict',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'dictionaries',
          localField: 'whichDict.dictId',
          foreignField: '_id',
          as: 'dict',
        },
      },
      {
        $unwind: {
          path: '$dict',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          maddeLength: {
            $strLenCP: '$madde',
          },
        },
      },
      {
        $unwind: {
          path: '$madde',
          preserveNullAndEmptyArrays: true,
        },
      }
    );
  } else {
    const realmaddeId = options.searchId.split('-')[0] || options.searchId;
    const anlamId = options.searchId.split('-')[1] || null;
    
    // ⚠️ CRITICAL FIX: Validate ObjectIds before query
    const isValidObjectId = (id) => {
      if (!id) return false;
      // Check if it's all zeros or invalid
      if (id === '000000000000000000000000' || id === '0'.repeat(24)) {
        console.log(`⚠️ [SEARCH-SERVICE] Invalid ObjectId detected (all zeros): ${id}`);
        return false;
      }
      // Check if it's a valid 24-char hex string
      if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        console.log(`⚠️ [SEARCH-SERVICE] Invalid ObjectId format: ${id}`);
        return false;
      }
      return true;
    };

    if (!isValidObjectId(realmaddeId)) {
      console.log(`❌ [SEARCH-SERVICE] Invalid madde ID: ${realmaddeId}. Returning empty result.`);
      return {
        data: [],
        meta: {
          total: 0,
          page: options.page || 1,
          limit: options.limit || 7,
          totalPages: 0
        }
      };
    }

    aggArray.push(
      {
        $match: {
          // madde: options.searchTerm,
          _id: ObjectId(realmaddeId),
        },
      },
      {
        $addFields: {
          sozlukler: {
            $reduce: {
              input: '$whichDict',
              initialValue: [],
              in: { $concatArrays: ['$$value', ['$$this.dictId']] },
            },
          },
        },
      },
      {
        $unwind: {
          path: '$whichDict',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // ⚠️ CRITICAL FIX: Only add anlamId match if valid
    if (anlamId && isValidObjectId(anlamId)) {
      console.log(`🔍 Adding whichDict.id filter: ${anlamId}`);
      aggArray.push({
        $match: {
          'whichDict.id': ObjectId(anlamId),
        },
      });
    } else if (anlamId) {
      console.log(`⚠️ [SEARCH-SERVICE] Skipping invalid anlamId: ${anlamId}`);
    }

    aggArray.push(
      {
        $lookup: {
          from: 'dictionaries',
          localField: 'whichDict.dictId',
          foreignField: '_id',
          as: 'dict',
        },
      },
      {
        $unwind: {
          path: '$dict',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Only add conditional match if there are actual conditions
    if (Object.keys(conditionalMatch).length > 0) {
      console.log(`🔍 Applying conditional filters:`, Object.keys(conditionalMatch));
      aggArray.push({
        $match: conditionalMatch,
      });
    }

    aggArray.push(
      {
        $addFields: {
          maddeLength: { $strLenCP: '$madde' },
        },
        // },
        // {
        //   $lookup: {
        //     from: 'maddes',
        //     localField: 'whichDict.karsiMaddeId',
        //     foreignField: '_id',
        //     as: 'karsi',
        //   },
      }
    );
  }
  const suboptions = { sort: 'maddeLength', limit: options.limit, page: options.page || 1 };
  
  // ⚠️ FIX: Add allowDiskUse for complex aggregations (maxTimeMS removed for compatibility)
  const agg = Madde.aggregate(aggArray).allowDiskUse(true);
  
  try {
    const maddeler = await Madde.aggregatePaginate(agg, options.searchType === 'random' ? '' : suboptions, (err, results) => {
      if (err) {
        console.error('❌ [SEARCH-SERVICE] Aggregation error:', err);
        throw err;
      }
      return results;
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ [SEARCH-SERVICE] getKelimeByMadde completed`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📈 Result Count: ${maddeler?.data?.length || 0}`);
    
    // Log pipeline in a way that shows RegExp properly
    const pipelineForLog = aggArray.map(stage => {
      const stageCopy = JSON.parse(JSON.stringify(stage));
      if (stage.$match) {
        Object.keys(stage.$match).forEach(key => {
          if (stage.$match[key] && stage.$match[key].$regex) {
            stageCopy.$match[key].$regex = stage.$match[key].$regex.toString();
          }
        });
      }
      return stageCopy;
    });
    console.log(`🔎 Aggregation Pipeline:`, JSON.stringify(pipelineForLog, null, 2));
    
    // Cache'e kaydet (sadece ilksorgu ve advanced için)
    if (options.searchType === 'ilksorgu' || options.searchType === 'advanced') {
      try {
        const cacheService = require('./cache.service');
        const cacheKey = cacheService.generateKey('search', {
          searchTerm: options.searchTerm,
          searchType: options.searchType,
          searchFilter: options.searchFilter,
          limit: options.limit,
          page: options.page
        });
        
        await cacheService.set(cacheKey, maddeler, 1800); // 30 dakika cache
        console.log(`💾 [SEARCH-SERVICE] Cached result for: ${options.searchTerm}`);
      } catch (cacheError) {
        console.log('⚠️ [SEARCH-SERVICE] Cache save error:', cacheError.message);
      }
    }
    
    return maddeler;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ [SEARCH-SERVICE] Query failed after ${duration}ms`);
    console.error(`Error:`, error.message);
    
    if (error.message && error.message.includes('operation exceeded time limit')) {
      console.error(`⏰ [SEARCH-SERVICE] Query timeout - operation took too long`);
    }
    
    throw error;
  }
};

const getKelimeByMaddeExceptItself = async (options) => {
  const conditionalMatch = {};

  if (options.searchDil && options.searchDil !== 'tumu' && options.searchDil !== 'undefined') {
    conditionalMatch['dict.lang'] = { $regex: new RegExp(`${options.searchDil}`, 'ig') };
  }

  const aggArray = [];

  const realmaddeId = options.searchId.split('-')[0] || options.searchId;
  const anlamId = options.searchId.split('-')[1] || null;
  aggArray.push(
    {
      $match: {
        madde: options.searchTerm,
        _id: ObjectId(realmaddeId),
      },
    },
    {
      $unwind: {
        path: '$whichDict',
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  if (anlamId) {
    aggArray.push({
      $match: {
        'whichDict.id': { $ne: ObjectId(anlamId) },
      },
    });
  }

  aggArray.push(
    {
      $lookup: {
        from: 'dictionaries',
        localField: 'whichDict.dictId',
        foreignField: '_id',
        as: 'dict',
      },
    },
    {
      $unwind: {
        path: '$dict',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: conditionalMatch,
    },
    {
      $addFields: {
        maddeLength: { $strLenCP: '$madde' },
      },
    }
    // {
    //   $lookup: {
    //     from: 'maddes',
    //     localField: 'whichDict.karsiMaddeId',
    //     foreignField: '_id',
    //     as: 'karsi',
    //   },
    // }
  );

  const suboptions = { sort: 'maddeLength' };
  const agg = Madde.aggregate(aggArray);
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } else {
      return results;
    }
  });

  return maddeler;
};
module.exports = {
  createKelimeler,
  queryKelimeler,
  getKelimeByMadde,
  rawQueryKelimeler,
  getKelimeById,
  updateDigeryazim,
  getKelimeByMaddeExceptItself,
};

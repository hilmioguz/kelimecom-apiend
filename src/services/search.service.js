/* eslint-disable security/detect-non-literal-regexp */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Madde } = require('../models');
const ApiError = require('../utils/ApiError');

const { ObjectId } = mongoose.Types;

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

const rawQueryKelimeler = async (options) => {
  const conditionalMatch = {};
  const conditionalMatch2 = {};
  const conditionalMatch3 = {};

  const langOrders = [];
  const defaultLangOrders = ['tr', 'en', 'os', 'ar', 'fa'];
  // eslint-disable-next-line no-console
  console.log('search service-->:', options);
  if (options.searchType === 'exact') {
    conditionalMatch.madde = options.searchTerm;
  } else if (options.searchType === 'advanced' && !['?', '*', '[', ']'].some((char) => options.searchTerm.includes(char))) {
    conditionalMatch.madde = options.searchTerm;
  } else if (options.searchType === 'advanced' && ['?', '*', '[', ']'].some((char) => options.searchTerm.includes(char))) {
    conditionalMatch.madde = {
      $regex: new RegExp(`^${options.searchTerm}$`, 'i'),
    };
  } else {
    conditionalMatch.madde = {
      $regex: new RegExp(`^${options.searchTerm}`, 'i'),
    };
  }

  if (options.searchFilter) {
    if (options.searchFilter.dil && options.searchFilter.dil !== 'tumu' && options.searchFilter.dil !== 'undefined') {
      conditionalMatch2['dict.lang'] = options.searchFilter.dil;
    }

    if (options.searchFilter.tip && options.searchFilter.tip !== 'tumu' && options.searchFilter.tip !== 'undefined') {
      conditionalMatch2['whichDict.tip'] = { $in: [options.searchFilter.tip] };
    }

    if (
      options.searchFilter.sozluk &&
      options.searchFilter.sozluk !== 'tumu' &&
      options.searchFilter.sozluk !== 'undefined'
    ) {
      conditionalMatch2['dict.code'] = { $regex: new RegExp(`^${options.searchFilter.sozluk}$`, 'i') };
    }

    if (options.searchFilter.filterOrders) {
      const f = options.searchFilter.filterOrders.split(',');
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

  if (['?'].some((char) => options.searchTerm.includes(char))) {
    const kelimemiz = options.searchTerm.length - 1;
    conditionalMatch3['madde-length'] = { $gte: kelimemiz };
  }

  const groupCond = {
    $group: {
      _id: '$dict.lang',
      madde: {
        $addToSet: '$madde',
      },
      karsiMaddeId: {
        $addToSet: '$karsiMaddeId',
      },
      digerMaddeId: {
        $addToSet: '$digerMaddeId',
      },
      whichDict: {
        $addToSet: '$whichDict',
      },
      dict: {
        $addToSet: '$dict',
      },
      langOrder: {
        $addToSet: '$langOrder',
      },
    },
  };

  const condition = [
    {
      $match: conditionalMatch,
    },
    {
      $unwind: {
        path: '$whichDict',
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
      },
    },
    {
      $match: conditionalMatch2,
    },
  ];

  if (options.searchType === 'advanced' || options.searchType === 'ilksorgu') {
    condition.push({
      $addFields: {
        langOrder: {
          $switch: {
            branches: langOrders,
          },
        },
      },
    });
    condition.push(groupCond);
    condition.push(
      {
        $unwind: {
          path: '$langOrder',
        },
      },
      {
        $unwind: {
          path: '$madde',
        },
      },
      {
        $addFields: {
          'madde-length': { $strLenCP: '$madde' },
        },
      }
    );
    if (conditionalMatch3) {
      condition.push({
        $match: conditionalMatch3,
      });
    }
  } else {
    condition.push({
      $addFields: {
        'madde-length': { $strLenCP: '$madde' },
        langOrder: {
          $switch: {
            branches: langOrders,
          },
        },
      },
    });
    if (conditionalMatch3) {
      condition.push({
        $match: conditionalMatch3,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('condition:', JSON.stringify(condition));

  const agg = Madde.aggregate(condition);

  const suboptions = {
    sort: { 'madde-length': 1, langOrder: 1 },
    limit: options.limit,
    page: options.page || 1,
  };

  // eslint-disable-next-line no-console
  console.log('suboptions:', suboptions);
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      return err;
    }
    return results;
  });
  return maddeler;
};

const getKelimeById = async (id) => {
  const agg = await Madde.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    {
      $lookup: {
        from: 'maddes',
        localField: '_id',
        foreignField: 'digerMaddeId',
        as: 'diger',
      },
    },
    {
      $lookup: {
        from: 'maddes',
        localField: '_id',
        foreignField: 'karsiMaddeId',
        as: 'karsi',
      },
    },
    {
      $unwind: {
        path: '$whichDict',
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
      },
    },
    {
      $addFields: {
        'madde-length': { $strLenCP: '$madde' },
      },
    },
  ]);
  // eslint-disable-next-line no-console
  console.log('madde:', agg);
  return agg;
};

const getKelimeByMadde = async (options) => {
  const conditionalMatch = {};

  if (options.searchTip && options.searchTip !== 'tumu' && options.searchTip !== 'undefined') {
    conditionalMatch['whichDict.tip'] = { $in: [options.searchTip] };
  }

  if (options.searchDil && options.searchDil !== 'tumu' && options.searchDil !== 'undefined') {
    conditionalMatch['dict.lang'] = { $regex: new RegExp(`${options.searchDil}`, 'ig') };
  }

  if (options.searchDict && options.searchDict !== 'tumu' && options.searchDict !== 'undefined') {
    conditionalMatch['dict.code'] = { $regex: new RegExp(`${options.searchDict}`, 'ig') };
  }

  const agg = Madde.aggregate([
    {
      $match: {
        madde: options.searchTerm,
      },
    },
    {
      $unwind: {
        path: '$whichDict',
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
      },
    },
    {
      $match: conditionalMatch,
    },
    {
      $addFields: {
        'madde-length': { $strLenCP: '$madde' },
      },
    },
  ]);
  const suboptions = { sort: 'madde-length', limit: options.limit, page: options.page || 1 };
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.err(err);
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
};

/* eslint-disable security/detect-unsafe-regex */
/* eslint-disable security/detect-non-literal-regexp */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Madde } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
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
  } else if (options.searchType === 'exactwithdash') {
    conditionalMatch.$or = [
      {
        madde: {
          $regex: new RegExp(`^${options.searchTerm}-`, 'i'),
        },
      },
      {
        madde: {
          $regex: new RegExp(`-${options.searchTerm}$`, 'i'),
        },
      },
      {
        madde: {
          $regex: new RegExp(` ${options.searchTerm} `, 'i'),
        },
      },
      {
        madde: {
          $regex: new RegExp(`^${options.searchTerm} `, 'i'),
        },
      },
      {
        madde: {
          $regex: new RegExp(` ${options.searchTerm}$`, 'i'),
        },
      },
      {
        madde: {
          $regex: new RegExp(`-${options.searchTerm}-`, 'i'),
        },
      },
    ];
  } else if (options.searchType === 'maddeanlam') {
    conditionalMatch['whichDict.anlam'] = {
      $regex: new RegExp(` ${options.searchTerm} `, 'i'),
    };
  } else if (
    options.searchType === 'advanced' &&
    !['?', '*', '[', ']', '(', ')', '.'].some((char) => options.searchTerm.includes(char))
  ) {
    conditionalMatch.madde = options.searchTerm;
  } else if (
    options.searchType === 'advanced' &&
    ['?', '*', '[', ']', '(', ')', '.'].some((char) => options.searchTerm.includes(char))
  ) {
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
  let kelimeuzunlugu = options.searchTerm.length;

  if (['*'].some((char) => options.searchTerm.includes(char))) {
    // eslint-disable-next-line no-invalid-regexp
    const xcount = options.searchTerm.match(/([*])/g);
    // eslint-disable-next-line no-console
    console.log('xcount', xcount, xcount.length);
    if (xcount) {
      kelimeuzunlugu -= xcount.length * 2;
    }
  }
  if (['(', ')'].some((char) => options.searchTerm.includes(char))) {
    const orcount = options.searchTerm.match(/(\([\u0020-\u0FFF|]+\))/g);
    // eslint-disable-next-line no-console
    console.log('orcount', orcount);
    if (orcount && orcount[0]) {
      kelimeuzunlugu -= orcount[0].length - 1;
    }
  }
  // eslint-disable-next-line no-console
  console.log('kelimeuzunlugu:', kelimeuzunlugu);
  conditionalMatch3.maddeLength = { $gte: kelimeuzunlugu };

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
    },
  };

  let condition = null;

  if (options.searchType === 'maddeanlam') {
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
      {
        $lookup: {
          from: 'maddes',
          localField: 'whichDict.karsiMaddeId',
          foreignField: '_id',
          as: 'karsi',
        },
      },
      {
        $lookup: {
          from: 'maddes',
          localField: 'whichDict.digerMaddeId',
          foreignField: '_id',
          as: 'diger',
        },
      },
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
      {
        $lookup: {
          from: 'maddes',
          localField: 'whichDict.karsiMaddeId',
          foreignField: '_id',
          as: 'karsi',
        },
      },
      {
        $match: conditionalMatch2,
      },
    ];
  }

  if (options.searchType === 'advanced') {
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
      {
        $unwind: {
          path: '$karsi',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          maddeLength: { $strLenCP: '$madde' },
          karsimadde: '$karsi.madde',
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
  } else if (options.searchType === 'ilksorgu') {
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
          path: '$madde',
        },
      },
      {
        $unwind: {
          path: '$langOrder',
        },
      },
      {
        $addFields: {
          maddeLength: { $strLenCP: '$madde' },
        },
      }
    );
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

  if (conditionalMatch3) {
    condition.push({
      $match: conditionalMatch3,
    });
  }

  // condition.push({ allowDiskUse: true });
  // eslint-disable-next-line no-console
  console.log('final condition:', JSON.stringify(condition));

  const agg = Madde.aggregate(condition).allowDiskUse(true);

  const suboptions = {
    sort: { maddeLength: 1, langOrder: 1 },
    limit: options.limit,
    page: options.page || 1,
  };

  // eslint-disable-next-line no-console
  console.log('-> suboptions:', suboptions);
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('ERROR_____>:', err);
      return err;
    }
    return results;
  });
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
    aggArray.push(
      {
        $match: {
          madde: options.searchTerm,
        },
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
        $match: conditionalMatch,
      },
      {
        $addFields: {
          maddeLength: { $strLenCP: '$madde' },
        },
      }
    );
  }
  const agg = Madde.aggregate(aggArray);

  const suboptions = { sort: 'maddeLength', limit: options.limit, page: options.page || 1 };

  const maddeler = await Madde.aggregatePaginate(agg, options.searchType === 'random' ? '' : suboptions, (err, results) => {
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

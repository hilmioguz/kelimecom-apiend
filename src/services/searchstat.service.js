const httpStatus = require('http-status');
const { Searchstat, User, Gundem, Kurumlar, Madde } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a search stat
 * @param {Object} searchBody
 * @returns {Promise<Searchstat>}
 */
const createSearchstat = async (searchBody) => {
  const stat = await Searchstat.create(searchBody);
  if (!stat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'search body db ye yazılamadı bir sorun var....');
  }
};

/**
 * Query for search stat
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySearchstat = async (filter, options) => {
  const stat = await Searchstat.paginate(filter, options);
  return stat;
};

const latestByLang = async (lang, limit = 10) => {
  const andBlock = [{ isInDict: true }];
  if (lang !== 'tumu') {
    andBlock.push({ secilenDil: lang });
  }
  const stat = await Searchstat.aggregate([
    {
      $match: {
        $and: andBlock,
        $or: [{ searchType: 'exact' }, { searchType: 'kelime' }],
      },
    },
    {
      $group: {
        _id: '$searchTerm',
        createdAt: {
          $first: '$createdAt',
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: limit,
    },
  ]);
  return stat;
};

const mostByLang = async (lang, limit = 10) => {
  const andBlock = [{ isInDict: true }];
  if (lang !== 'tumu') {
    andBlock.push({ secilenDil: lang });
  }
  const stat = await Searchstat.aggregate([
    {
      $match: {
        $and: andBlock,
        $or: [{ searchType: 'exact' }, { searchType: 'kelime' }],
      },
    },
    {
      $group: {
        _id: '$searchTerm',
        count: {
          $sum: 1,
        },
        createdAt: {
          $first: '$createdAt',
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
    {
      $limit: limit,
    },
  ]);
  return stat;
};

const lastAddedGundem = async (lang = null, limit = 10) => {
  const agg = [
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
      $project: {
        madde: 1,
        dict: '$dict.anlamLang',
      },
    },
  ];

  if (lang) {
    agg.push({
      $match: {
        dict: lang,
      },
    });
  }

  agg.push(
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        madde: 1,
        _id: 0,
      },
    }
  );

  const stat = await Gundem.aggregate(agg);
  return stat;
};

const allStats = async () => {
  const useragg = [
    {
      $group: {
        _id: '$packetId',
        count: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: 'packets',
        localField: '_id',
        foreignField: '_id',
        as: 'paket',
      },
    },
    {
      $unwind: {
        path: '$paket',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        paketadi: '$paket.name',
      },
    },
    {
      $unset: ['paket', '_id'],
    },
  ];
  const userstat = await User.aggregate(useragg);

  const gundemuseragg = [
    {
      $group: {
        _id: '$whichDict.userSubmitted',
        maddeler: {
          $addToSet: '$madde',
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $unwind: {
        path: '$_id',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        maddeler: {
          $slice: ['$maddeler', -3],
        },
        count: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'name',
      },
    },
    {
      $unwind: {
        path: '$name',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $addFields: {
        name: '$name.name',
        kurumu: '$name.kurumId',
      },
    },
    {
      $lookup: {
        from: 'kurumlar',
        localField: 'kurumu',
        foreignField: '_id',
        as: 'kurumu',
      },
    },
    {
      $unwind: {
        path: '$kurumu',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $addFields: {
        kurumu: '$kurumu.institution_name',
      },
    },
    {
      $unset: ['_id'],
    },
  ];
  const gundemstat = await Gundem.aggregate(gundemuseragg);
  const kurumagg = [
    {
      $group: {
        _id: {
          aktif: '$isActive',
          status: '$status',
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        aktif: '$_id.aktif',
        status: '$_id.status',
        count: 1,
        _id: 0,
      },
    },
  ];
  const kurumstat = await Kurumlar.aggregate(kurumagg);
  const maddeagg = [
    {
      $count: 'count',
    },
  ];
  const totalMaddestat = await Madde.aggregate(maddeagg);

  const gundemagg = [
    {
      $count: 'count',
    },
  ];
  const totalGundemstat = await Gundem.aggregate(gundemagg);

  return { userstat, gundemstat, kurumstat, totalMaddestat, totalGundemstat };
};
module.exports = {
  createSearchstat,
  querySearchstat,
  latestByLang,
  mostByLang,
  allStats,
  lastAddedGundem,
};

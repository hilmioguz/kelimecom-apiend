const httpStatus = require('http-status');
const assert = require('assert');
const { Madde } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a madde
 * @param {Object} maddeBody
 * @returns {Promise<Madde>}
 */
const createMadde = async (maddeBody) => {
  if (await Madde.isMaddeAlrearyInDB(maddeBody.madde)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten tanımlı');
  }
  const madde = await Madde.create(maddeBody);
  return madde;
};

/**
 * Query for madde
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMaddeler = async (filter, options) => {
  let maddeler;
  if (options.type && options.type === 'searchText') {
    maddeler = await Madde.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    maddeler = await Madde.paginate(filter, options);
  }
  return maddeler;
};

const rawQueryMaddeler = async (madde) => {
  const agg = [
    {
      $match: {
        madde: {
          // eslint-disable-next-line security/detect-non-literal-regexp
          $regex: new RegExp(`^${madde}`, 'g'),
        },
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
      $sort: {
        madde: 1,
      },
    },
  ];
  const maddeler = await Madde.aggregate(agg, (cmdErr, result) => {
    assert.equal(null, cmdErr);
  });

  return maddeler;
};

/**
 * Get madde by id
 * @param {ObjectId} id
 * @returns {Promise<Madde>}
 */
const getMaddeById = async (id) => {
  return Madde.findById(id);
};

/**
 * Get madde by madde name
 * @param {string} madde
 * @returns {Promise<Madde>}
 */
const getMaddeByName = async (madde) => {
  return Madde.findOne({ madde });
};

/**
 * Update madde by id
 * @param {ObjectId} maddeId
 * @param {Object} updateBody
 * @returns {Promise<Madde>}
 */
const updateMaddeById = async (maddeId, updateBody) => {
  const madde = await getMaddeById(maddeId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  if (updateBody.madde && (await Madde.isMaddeAlrearyInDB(updateBody.madde, maddeId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten daha önce kayıtlı');
  }
  Object.assign(madde, updateBody);
  await madde.save();
  return madde;
};

/**
 * Delete madde by id
 * @param {ObjectId} maddeId
 * @returns {Promise<Madde>}
 */
const deleteMaddeById = async (maddeId) => {
  const madde = await getMaddeById(maddeId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  await madde.remove();
  return madde;
};

module.exports = {
  createMadde,
  queryMaddeler,
  rawQueryMaddeler,
  getMaddeById,
  getMaddeByName,
  updateMaddeById,
  deleteMaddeById,
};

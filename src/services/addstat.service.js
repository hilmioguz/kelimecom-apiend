const httpStatus = require('http-status');
const { Addstat } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a add stat
 * @param {Object} addBody
 * @returns {Promise<Addstat>}
 */
const createAddstat = async (addBody) => {
  const stat = await Addstat.create(addBody);
  if (!stat) {
    throw new ApiError(httpStatus.NOT_FOUND, 'add body db ye yazılamadı bir sorun var....');
  }
};

/**
 * Query for add stat
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAddstat = async (filter, options) => {
  const stat = await Addstat.paginate(filter, options);
  return stat;
};

const latestByLang = async (lang, limit = 10) => {
  const stat = await Addstat.aggregate([
    {
      $match: {
        secilenDil: lang,
      },
    },
    {
      $group: {
        _id: '$addTerm',
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
  const stat = await Addstat.aggregate([
    {
      $match: {
        secilenDil: lang,
      },
    },
    {
      $group: {
        _id: '$addTerm',
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
module.exports = {
  createAddstat,
  queryAddstat,
  latestByLang,
  mostByLang,
};

const httpStatus = require('http-status');
const { Searchstat } = require('../models');
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
  const stat = await Searchstat.aggregate([
    {
      $match: {
        secilenDil: lang,
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
  const stat = await Searchstat.aggregate([
    {
      $match: {
        secilenDil: lang,
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
module.exports = {
  createSearchstat,
  querySearchstat,
  latestByLang,
  mostByLang,
};

const httpStatus = require('http-status');
const { Userhistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a userhistory
 * @param {Object} historyBody
 * @returns {Promise<Userhistory>}
 */
const createHistory = async (historyBody) => {
  const history = await Userhistory.create(historyBody);
  return history;
};

/**
 * Query for history
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryHistories = async (filter, options) => {
  const histories = await Userhistory.paginate(filter, options);
  return histories;
};

/**
 * Get history by id
 * @param {ObjectId} id
 * @returns {Promise<Userhistory>}
 */
const getHistoryById = async (id) => {
  return Userhistory.findById(id);
};

/**
 * Get history by userId
 * @param {ObjectId} userId
 * @returns {Promise<Userhistory>}
 */
const getHistoryByUserId = async (userId) => {
  return Userhistory.findById(userId);
};

/**
 * Get history by madde name
 * @param {string} arananMadde
 * @returns {Promise<Userhistory>}
 */
const getHistoryByMadde = async (arananMadde) => {
  return Userhistory.find({ arananMadde });
};

/**
 * Delete history by id
 * @param {ObjectId} historyId
 * @returns {Promise<Userhistory>}
 */
const deleteHistoryById = async (historyId) => {
  const history = await getHistoryById(historyId);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde logu bulunamadı');
  }
  await history.remove();
  return history;
};

module.exports = {
  createHistory,
  queryHistories,
  getHistoryById,
  getHistoryByUserId,
  getHistoryByMadde,
  deleteHistoryById,
};

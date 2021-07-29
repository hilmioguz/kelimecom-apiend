const httpStatus = require('http-status');
const { Guesthistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a userhistory
 * @param {Object} historyBody
 * @returns {Promise<Guesthistory>}
 */
const createHistory = async (historyBody) => {
  const history = await Guesthistory.create(historyBody);
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
  const histories = await Guesthistory.paginate(filter, options);
  return histories;
};

/**
 * Get history by id
 * @param {ObjectId} id
 * @returns {Promise<Guesthistory>}
 */
const getHistoryById = async (id) => {
  return Guesthistory.findById(id);
};

/**
 * Get history by guestId
 * @param {ObjectId} guestId
 * @returns {Promise<Guesthistory>}
 */
const getHistoryByGuestId = async (guestId) => {
  return Guesthistory.findById(guestId);
};

/**
 * Get history by madde name
 * @param {string} arananMadde
 * @returns {Promise<Guesthistory>}
 */
const getHistoryByMadde = async (arananMadde) => {
  return Guesthistory.find({ arananMadde });
};

/**
 * Delete history by id
 * @param {ObjectId} historyId
 * @returns {Promise<Guesthistory>}
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
  getHistoryByGuestId,
  getHistoryByMadde,
  deleteHistoryById,
};

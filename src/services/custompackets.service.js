const httpStatus = require('http-status');
const { Custompackets } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a custom
 * @param {Object} customBody
 * @returns {Promise<Custompackets>}
 */
const createCustom = async (customBody) => {
  if (await Custompackets.isCustomAlreadyInDB(customBody)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Custom Paket seçeneği zaten tanımlı');
  }
  const custom = await Custompackets.create(customBody);
  return custom;
};

/**
 * Query for custom
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCustoms = async (filter, options) => {
  const opts = await Custompackets.paginate(filter, options);
  return opts;
};

/**
 * Get custom by id
 * @param {ObjectId} id
 * @returns {Promise<Custompackets>}
 */
const getCustomById = async (id) => {
  return Custompackets.findById(id);
};
/**
 * Get customs by packet id
 * @param {ObjectId} packetId
 * @returns {Promise<Custompackets>}
 */
const getCustomsByPacketId = async (packetId) => {
  return Custompackets.find({ packetId });
};
/**
 * Get custom by custom's name
 * @param {string} name
 * @returns {Promise<Custompackets>}
 */
const getCustomByName = async (name) => {
  return Custompackets.findOne({ name });
};

/**
 * Update custom by id
 * @param {ObjectId} customId
 * @param {Object} updateBody
 * @returns {Promise<Custompackets>}
 */
const updateCustomById = async (customId, updateBody) => {
  const custom = await getCustomById(customId);
  if (!custom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom Paket seçeneği bulunamadı');
  }
  if (updateBody.name && (await Custompackets.isCustomAlreadyInDB(updateBody, customId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Custom Paket seçeneği zaten daha önce kayıtlı');
  }
  Object.assign(custom, updateBody);
  await custom.save();
  return custom;
};

/**
 * Delete custom by id
 * @param {ObjectId} customId
 * @returns {Promise<Custompackets>}
 */
const deleteCustomById = async (customId) => {
  const custom = await getCustomById(customId);
  if (!custom) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom Paket seçeneği bulunamadı');
  }
  await custom.remove();
  return custom;
};

module.exports = {
  createCustom,
  queryCustoms,
  getCustomById,
  getCustomsByPacketId,
  getCustomByName,
  updateCustomById,
  deleteCustomById,
};

const httpStatus = require('http-status');
const { Packetoptions } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a option
 * @param {Object} optionBody
 * @returns {Promise<Packetoptions>}
 */
const createOption = async (optionBody) => {
  if (await Packetoptions.isOptionAlreadyInDB(optionBody)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Paket seçeneği zaten tanımlı');
  }
  const option = await Packetoptions.create(optionBody);
  return option;
};

/**
 * Query for option
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryOptions = async (filter, options) => {
  const opts = await Packetoptions.paginate(filter, options);
  return opts;
};

/**
 * Get option by id
 * @param {ObjectId} id
 * @returns {Promise<Packetoptions>}
 */
const getOptionById = async (id) => {
  return Packetoptions.findById(id);
};
/**
 * Get options by packet id
 * @param {ObjectId} packetId
 * @returns {Promise<Packetoptions>}
 */
const getOptionsByPacketId = async (packetId) => {
  return Packetoptions.find({ packetId });
};
/**
 * Get option by option's name
 * @param {string} name
 * @returns {Promise<Packetoptions>}
 */
const getOptionByName = async (name) => {
  return Packetoptions.findOne({ name });
};

/**
 * Update option by id
 * @param {ObjectId} optionId
 * @param {Object} updateBody
 * @returns {Promise<Packetoptions>}
 */
const updateOptionById = async (optionId, updateBody) => {
  const option = await getOptionById(optionId);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Paket seçeneği bulunamadı');
  }
  if (updateBody.name && (await Packetoptions.isOptionAlreadyInDB(updateBody, optionId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Paket seçeneği zaten daha önce kayıtlı');
  }
  Object.assign(option, updateBody);
  await option.save();
  return option;
};

/**
 * Delete option by id
 * @param {ObjectId} optionId
 * @returns {Promise<Packetoptions>}
 */
const deleteOptionById = async (optionId) => {
  const option = await getOptionById(optionId);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Paket seçeneği bulunamadı');
  }
  await option.remove();
  return option;
};

module.exports = {
  createOption,
  queryOptions,
  getOptionById,
  getOptionsByPacketId,
  getOptionByName,
  updateOptionById,
  deleteOptionById,
};

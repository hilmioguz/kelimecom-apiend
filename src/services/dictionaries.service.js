const httpStatus = require('http-status');
const { Dictionaries } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a dictionary
 * @param {Object} dictBoddy
 * @returns {Promise<Dictionaries>}
 */
const createDictionaries = async (dictBoddy) => {
  if (await Dictionaries.isDictionariesAlrearyInDB(dictBoddy.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Sözlük zaten tanımlı');
  }
  const dictionary = await Dictionaries.create(dictBoddy);
  return dictionary;
};

/**
 * Query for a dictionary
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDictionaries = async (filter, options) => {
  const dictionaries = await Dictionaries.paginate(filter, options);
  return dictionaries;
};

/**
 * Get dictionary by id
 * @param {ObjectId} id
 * @returns {Promise<Dictionaries>}
 */
const getDictionariesById = async (id) => {
  return Dictionaries.findById(id);
};

/**
 * Get dictionary by name
 * @param {string} name
 * @returns {Promise<Dictionaries>}
 */
const getDictionariesByName = async (name) => {
  return Dictionaries.findOne({ name });
};

/**
 * Update dictionary by id
 * @param {ObjectId} dictionaryId
 * @param {Object} updateBody
 * @returns {Promise<Dictionaries>}
 */
const updateDictionariesById = async (dictionaryId, updateBody) => {
  const dictionary = await getDictionariesById(dictionaryId);
  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  if (updateBody.dictionary && (await Dictionaries.isDictionariesAlrearyInDB(updateBody.name, dictionaryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Sözlük zaten daha önce kayıtlı');
  }
  Object.assign(dictionary, updateBody);
  await dictionary.save();
  return dictionary;
};

/**
 * Delete dictionary by id
 * @param {ObjectId} dictionaryId
 * @returns {Promise<Dictionaries>}
 */
const deleteDictionariesById = async (dictionaryId) => {
  const dictionary = await getDictionariesById(dictionaryId);
  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  await dictionary.remove();
  return dictionary;
};

module.exports = {
  createDictionaries,
  queryDictionaries,
  getDictionariesById,
  getDictionariesByName,
  updateDictionariesById,
  deleteDictionariesById,
};

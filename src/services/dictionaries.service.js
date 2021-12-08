const httpStatus = require('http-status');
const fetch = require('node-fetch');
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
  try {
    await fetch('http://frontend:5000/redisClient/f0c8ffa4df03ef51ba9c63ec18b01f4a/sozlukler');
    // eslint-disable-next-line no-console
    console.log('sozlukler silindi');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
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
  try {
    await fetch('http://frontend:5000/redisClient/f0c8ffa4df03ef51ba9c63ec18b01f4a/sozlukler');
    // eslint-disable-next-line no-console
    console.log('sozlukler silindi');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
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
  try {
    await fetch('http://frontend:5000/redisClient/f0c8ffa4df03ef51ba9c63ec18b01f4a/sozlukler');
    // eslint-disable-next-line no-console
    console.log('sozlukler silindi');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
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

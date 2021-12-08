const httpStatus = require('http-status');
const fetch = require('node-fetch');
const { Kurumlar } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Create a kurum
 * @param {Object} kurumBody
 * @returns {Promise<Kurumlar>}
 */
const createKurum = async (kurumBody) => {
  if (await Kurumlar.isKurumAlrearyInDB(kurumBody.institution_name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kurumlar zaten tanımlı');
  }
  const kurum = await Kurumlar.create(kurumBody);
  try {
    await fetch('http://frontend:5000/redisClient/f0c8ffa4df03ef51ba9c63ec18b01f4a/kurumlar');
    // eslint-disable-next-line no-console
    console.log('kurumlar silindi');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
  return kurum;
};

/**
 * Query for kurum
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryKurumlar = async (filter, options) => {
  // eslint-disable-next-line no-console
  console.log('FİLTER:', filter);
  const kurums = await Kurumlar.paginate(filter, options);
  return kurums;
};

/**
 * Get kurum by id
 * @param {ObjectId} id
 * @returns {Promise<Kurumlars>}
 */
const getKurumById = async (id) => {
  return Kurumlar.findById(id);
};
/**
 * Get aktive kurums
 * @param {ObjectId} id
 * @returns {Promise<Kurumlars>}
 */
const getKurumAktive = async () => {
  return Kurumlar.find({ isActive: true });
};

/**
 * Get kurum by kurum name
 * @param {string} name
 * @returns {Promise<Kurumlars>}
 */
const getKurumByName = async (name) => {
  return Kurumlar.findOne({ name });
};

/**
 * Update kurum by id
 * @param {ObjectId} kurumId
 * @param {Object} updateBody
 * @returns {Promise<Kurumlars>}
 */
const updateKurumById = async (kurumId, updateBody) => {
  const kurum = await getKurumById(kurumId);
  if (!kurum) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kurum bulunamadı');
  }
  if (updateBody.kurum && (await Kurumlar.isKurumAlrearyInDB(updateBody.kurum, kurumId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kurum zaten daha önce kayıtlı');
  }
  Object.assign(kurum, updateBody);
  await kurum.save();
  try {
    await fetch('http://frontend:5000/redisClient/f0c8ffa4df03ef51ba9c63ec18b01f4a/kurumlar');
    // eslint-disable-next-line no-console
    console.log('kurumlar silindi');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
  return kurum;
};

/**
 * Delete kurum by id
 * @param {ObjectId} kurumId
 * @returns {Promise<Kurumlars>}
 */
const deleteKurumById = async (kurumId) => {
  const kurum = await getKurumById(kurumId);
  if (!kurum) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kurum bulunamadı');
  }
  await kurum.remove();
  try {
    await fetch('http://frontend:5000/redisClient/f0c8ffa4df03ef51ba9c63ec18b01f4a/kurumlar');
    // eslint-disable-next-line no-console
    console.log('kurumlar silindi');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err.message);
  }
  return kurum;
};

module.exports = {
  createKurum,
  queryKurumlar,
  getKurumAktive,
  getKurumById,
  getKurumByName,
  updateKurumById,
  deleteKurumById,
};

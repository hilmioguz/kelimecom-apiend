const httpStatus = require('http-status');
const { SiteLanguage } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a sitelanguage
 * @param {Object} siteLanguageBody
 * @returns {Promise<SiteLanguage>}
 */
const createSiteLanguage = async (siteLanguageBody) => {
  if (await SiteLanguage.isSiteLanguageAlrearyInDB(siteLanguageBody.value)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'SiteLanguage zaten tanımlı');
  }
  const sitelanguage = await SiteLanguage.create(siteLanguageBody);
  return sitelanguage;
};

/**
 * Query for sitelanguage
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySiteLanguages = async (filter, options) => {
  const sitelanguages = await SiteLanguage.paginate(filter, options);
  return sitelanguages;
};

/**
 * Get sitelanguage by id
 * @param {ObjectId} id
 * @returns {Promise<SiteLanguage>}
 */
const getSiteLanguageById = async (value) => {
  return SiteLanguage.findOne({ value });
};

/**
 * Get sitelanguage by sitelanguage name
 * @param {string} name
 * @returns {Promise<SiteLanguage>}
 */
const getSiteLanguageByName = async (value) => {
  return SiteLanguage.findOne({ value });
};

/**
 * Update sitelanguage by id
 * @param {String} value
 * @param {Object} updateBody
 * @returns {Promise<SiteLanguage>}
 */
const updateSiteLanguageById = async (value, updateBody) => {
  const sitelanguage = await getSiteLanguageById(value);
  if (!sitelanguage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'sitelanguage bulunamadı');
  }
  Object.assign(sitelanguage, updateBody);
  await sitelanguage.save();
  return sitelanguage;
};

/**
 * Delete sitelanguage by id
 * @param {String} value
 * @returns {Promise<SiteLanguage>}
 */
const deleteSiteLanguageById = async (value) => {
  const sitelanguage = await getSiteLanguageById(value);
  if (!sitelanguage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'sitelanguage bulunamadı');
  }
  await sitelanguage.remove();
  return sitelanguage;
};

module.exports = {
  createSiteLanguage,
  querySiteLanguages,
  getSiteLanguageById,
  getSiteLanguageByName,
  updateSiteLanguageById,
  deleteSiteLanguageById,
};

const httpStatus = require('http-status');
// const fetch = require('node-fetch');
const mongoose = require('mongoose');
const { Kuluckasection, Kuluckamadde, User } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;
/**
 * Create a section
 * @param {Object} dictBoddy
 * @returns {Promise<Kuluckasection>}
 */
const createSections = async (dictBoddy) => {
  if (await Kuluckasection.isSectionsAlrearyInDB(dictBoddy.name, dictBoddy.dictId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Set zaten tanımlı');
  }
  if (typeof dictBoddy.pages === 'string') {
    // eslint-disable-next-line no-param-reassign
    dictBoddy.pages = JSON.parse(dictBoddy.pages);
  }
  const section = await Kuluckasection.create(dictBoddy);
  return section;
};

/**
 * Query for a section
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySections = async (filter, options) => {
  const dictionaries = await Kuluckasection.paginate(filter, options);
  return dictionaries;
};

/**
 * Get section by id
 * @param {ObjectId} id
 * @returns {Promise<Kuluckasection>}
 */
const getSectionsById = async (id) => {
  return Kuluckasection.findById(id);
};

const getNextSectionsById = async (id) => {
  return Kuluckasection.find({ _id: { $gt: id } })
    .sort({ _id: 1 })
    .limit(1);
};
/**
 * Get section by name
 * @param {string} name
 * @returns {Promise<Kuluckasection>}
 */
const getSectionsByName = async (name) => {
  return Kuluckasection.findOne({ name });
};

/**
 * Update section by id
 * @param {ObjectId} sectionId
 * @param {Object} updateBody
 * @returns {Promise<Kuluckasection>}
 */
const updateSectionsById = async (sectionId, updateBody) => {
  const section = await getSectionsById(sectionId);
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  if (updateBody.section && (await Kuluckasection.isSectionsAlrearyInDB(updateBody.name, sectionId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Set zaten daha önce kayıtlı');
  }
  if (typeof updateBody.pages === 'string') {
    // eslint-disable-next-line no-param-reassign
    updateBody.pages = JSON.parse(updateBody.pages);
  }
  Object.assign(section, updateBody);
  await section.save();
  return section;
};
const sectionRegister = async (sectionId, userId, isModerater) => {
  const section = await getSectionsById(sectionId);
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  if (isModerater) {
    section.controlAssigned = userId;
  } else {
    section.userAssigned = userId;
  }
  const user = await User.findById(userId);
  user.assignedSet = sectionId;
  await user.save();
  await section.save();
  return user;
};
const sectionDelivered = async (sectionId, userId) => {
  const section = await getSectionsById(sectionId);
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  section.isDelivered = true;
  const user = await User.findById(userId);
  user.assignedSet = null;
  await user.save();
  await section.save();
  try {
    await Kuluckamadde.updateMany(
      { 'whichDict.userSubmitted': ObjectId(userId) },
      {
        $set: {
          'whichDict.$.isDelivered': true,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Section DELİVERED:', error);
  }

  return user;
};
const sectionControlled = async (sectionId, userId, userSubmitted) => {
  const section = await getSectionsById(sectionId);
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  section.isControlled = true;
  section.isActive = false;
  const user = await User.findById(userId);
  user.assignedSet = null;
  await user.save();
  await section.save();
  try {
    await Kuluckamadde.updateMany(
      { 'whichDict.userSubmitted': ObjectId(userSubmitted) },
      {
        $set: {
          'whichDict.$.isControlled': true,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Section sectionControlled:', error);
  }
  return user;
};
/**
 * Delete section by id
 * @param {ObjectId} sectionId
 * @returns {Promise<Kuluckasection>}
 */
const deleteSectionsById = async (sectionId) => {
  const section = await getSectionsById(sectionId);
  if (!section) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  await section.remove();
  return section;
};

module.exports = {
  createSections,
  querySections,
  getSectionsById,
  getSectionsByName,
  updateSectionsById,
  deleteSectionsById,
  sectionRegister,
  sectionDelivered,
  sectionControlled,
  getNextSectionsById,
};

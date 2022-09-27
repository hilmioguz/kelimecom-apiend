const httpStatus = require('http-status');
const assert = require('assert');
const mongoose = require('mongoose');
const { Madde } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;
/**
 * Create a madde
 * @param {Object} maddeBody
 * @returns {Promise<Madde>}
 */
const createMadde = async (maddeBody) => {
  if (await Madde.isMaddeAlrearyInDB(maddeBody.madde)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten tanımlı');
  }
  const madde = await Madde.create(maddeBody);
  return madde;
};

const createSubMadde = async (maddeId, maddeBody) => {
  const madde = await Madde.updateOne(
    { _id: ObjectId(maddeId) },
    { $push: { whichDict: maddeBody } },
    { new: true, upsert: true }
  );
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde anlamı eklenemedi.');
  }

  return madde;
};

/**
 * Query for madde
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMaddeler = async (filter, options) => {
  let maddeler;
  if (options.type && options.type === 'searchText') {
    maddeler = await Madde.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    maddeler = await Madde.paginate(filter, options);
  }
  return maddeler;
};

const rawQueryMaddeler = async (madde) => {
  const agg = [
    {
      $match: {
        madde: {
          // eslint-disable-next-line security/detect-non-literal-regexp
          $regex: new RegExp(`^${madde}`, 'g'),
        },
      },
    },
    {
      $unwind: {
        path: '$whichDict',
      },
    },
    {
      $lookup: {
        from: 'dictionaries',
        localField: 'whichDict.dictId',
        foreignField: '_id',
        as: 'dict',
      },
    },
    {
      $unwind: {
        path: '$dict',
      },
    },
    {
      $sort: {
        madde: 1,
      },
    },
  ];
  // eslint-disable-next-line no-unused-vars
  const maddeler = await Madde.aggregate(agg, (cmdErr, result) => {
    assert.equal(null, cmdErr);
  });

  return maddeler;
};

/**
 * Get madde by id
 * @param {ObjectId} id
 * @returns {Promise<Madde>}
 */
const getMaddeById = async (id) => {
  return Madde.findById(id);
};

/**
 * Get madde by madde name
 * @param {string} madde
 * @returns {Promise<Madde>}
 */
const getMaddeByName = async (madde) => {
  return Madde.findOne({ madde });
};

/**
 * Update madde by id
 * @param {ObjectId} maddeId
 * @param {Object} updateBody
 * @returns {Promise<Madde>}
 */
const updateMaddeById = async (maddeId, updateBody) => {
  const madde = await getMaddeById(maddeId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  if (updateBody.madde && (await Madde.isMaddeAlrearyInDB(updateBody.madde, maddeId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten daha önce kayıtlı');
  }
  Object.assign(madde, updateBody);
  await madde.save();
  return madde;
};

const updateSubMaddeById = async (maddeId, updateBody) => {
  const madde = await Madde.updateOne(
    { _id: ObjectId(maddeId), 'whichDict.id': ObjectId(updateBody.id) },
    {
      $set: {
        digeryazim: updateBody.digeryazim,
        'whichDict.$.anlam': updateBody.anlam,
        'whichDict.$.dictId': updateBody.dictId,
        'whichDict.$.tur': updateBody.tur,
        'whichDict.$.alttur': updateBody.alttur,
        'whichDict.$.tip': updateBody.tip,
        'whichDict.$.koken': updateBody.koken,
        'whichDict.$.cinsiyet': updateBody.cinsiyet,
        'whichDict.$.bicim': updateBody.bicim,
        'whichDict.$.sinif': updateBody.sinif,
        'whichDict.$.transkripsiyon': updateBody.transkripsiyon,
        'whichDict.$.fonetik': updateBody.fonetik,
        'whichDict.$.heceliyazim': updateBody.heceliyazim,
        'whichDict.$.zitanlam': updateBody.zitanlam,
        'whichDict.$.esanlam': updateBody.esanlam,
        'whichDict.$.telaffuz': updateBody.telaffuz,
        'whichDict.$.kokleri': updateBody.kokleri,
        'whichDict.$.sesDosyasi': updateBody.sesDosyasi,
        'whichDict.$.location': updateBody.location,
        'whichDict.$.eserindili': updateBody.eserindili,
        'whichDict.$.kokeni': updateBody.kokeni,
        'whichDict.$.eserindonemi': updateBody.eserindonemi,
        'whichDict.$.eserinyili': updateBody.eserinyili,
        'whichDict.$.eserinyazari': updateBody.eserinyazari,
        'whichDict.$.esertxt': updateBody.esertxt,
        'whichDict.$.dili': updateBody.dili,
        'whichDict.$.kokendili': updateBody.kokendili,
        'whichDict.$.karsi': updateBody.karsi,
        'whichDict.$.sozusoyleyen': updateBody.sozusoyleyen,
        'whichDict.$.sekil': updateBody.sekil,
        'whichDict.$.tarihcesi': updateBody.tarihcesi,
        'whichDict.$.bulunduguSayfalar': updateBody.bulunduguSayfalar,
      },
    },
    { upsert: true }
  );
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }

  return madde;
};

/**
 * Delete madde by id
 * @param {ObjectId} maddeId
 * @returns {Promise<Madde>}
 */
const deleteMaddeById = async (maddeId) => {
  const madde = await Madde.deleteOne({ _id: maddeId });
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  return madde;
};

const deleteSubMaddeById = async (maddeId, anlamId) => {
  const madde = await Madde.updateOne(
    { _id: ObjectId(maddeId), 'whichDict.id': ObjectId(anlamId) },
    { $pull: { whichDict: { id: ObjectId(anlamId) } } },
    { new: true, upsert: true }
  );
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }

  return madde;
};

const userMaddeFavorites = async (id, anlamId, userId, method) => {
  let sonuc = null;
  if (method === 'insert') {
    sonuc = await Madde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $push: { 'whichDict.$.favorites': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Madde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $pull: { 'whichDict.$.favorites': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (sonuc) {
    return true;
  }
  return false;
};

const userMaddeLikes = async (id, anlamId, userId, method) => {
  let sonuc = null;
  if (method === 'insert') {
    sonuc = await Madde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $push: { 'whichDict.$.likes': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Madde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $pull: { 'whichDict.$.likes': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }

  if (sonuc) {
    return true;
  }
  return false;
};

module.exports = {
  createMadde,
  createSubMadde,
  queryMaddeler,
  rawQueryMaddeler,
  getMaddeById,
  updateSubMaddeById,
  getMaddeByName,
  updateMaddeById,
  deleteMaddeById,
  deleteSubMaddeById,
  userMaddeFavorites,
  userMaddeLikes,
};

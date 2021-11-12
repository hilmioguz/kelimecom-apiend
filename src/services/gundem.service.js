const httpStatus = require('http-status');
const assert = require('assert');
const mongoose = require('mongoose');
const { Gundem } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;

const createSubMadde = async (maddeId, maddeBody) => {
  const newmadde = maddeBody;
  newmadde.id = new ObjectId();
  const madde = await Gundem.updateOne({ _id: ObjectId(maddeId) }, { $push: { whichDict: newmadde } }, { new: true });
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
    maddeler = await Gundem.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    maddeler = await Gundem.paginate(filter, options);
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
  const maddeler = await Gundem.aggregate(agg, (cmdErr, result) => {
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
  return Gundem.findById(id);
};

/**
 * Get madde by madde name
 * @param {string} madde
 * @returns {Promise<Madde>}
 */
const getMaddeByName = async (madde) => {
  return Gundem.findOne({ madde });
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
  if (updateBody.madde && (await Gundem.isMaddeAlrearyInDB(updateBody.madde, maddeId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten daha önce kayıtlı');
  }
  Object.assign(madde, updateBody);
  await madde.save();
  return madde;
};

const updateSubMaddeById = async (maddeId, updateBody) => {
  const madde = await Gundem.updateOne(
    { _id: ObjectId(maddeId), 'whichDict.id': ObjectId(updateBody.id) },
    {
      $set: {
        'whichDict.$.anlam': updateBody.anlam,
        'whichDict.$.dictId': updateBody.dictId,
        'whichDict.$.digerMaddeId': updateBody.digerMaddeId,
        'whichDict.$.karsiMaddeId': updateBody.karsiMaddeId,
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
        'whichDict.$.isActive': updateBody.isActive,
        'whichDict.$.userConfirmed': updateBody.userConfirmed,
        'whichDict.$.userSubmitted': updateBody.userSubmitted,
        'whichDict.$.updatedAt': Date.now(),
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
 * Create a madde
 * @param {Object} maddeBody
 * @returns {Promise<Madde>}
 */
const createMadde = async (maddeBody) => {
  const found = await Gundem.findOne({ madde: maddeBody.madde });
  let madde;
  if (found) {
    // eslint-disable-next-line no-console
    console.log('Madde:---Z', found._id);
    const payload = maddeBody.whichDict;
    // eslint-disable-next-line no-console
    console.log('Madde:---eewe', payload);
    madde = await createSubMadde(found._id, payload);
  } else {
    madde = await Gundem.create(maddeBody);
  }
  // if (await Gundem.isMaddeAlrearyInDB(maddeBody.madde)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten tanımlı');
  // }
  return madde;
};
/**
 * Delete madde by id
 * @param {ObjectId} maddeId
 * @returns {Promise<Madde>}
 */
const deleteMaddeById = async (maddeId) => {
  const madde = await Gundem.deleteOne({ _id: maddeId });
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  return madde;
};

const deleteSubMaddeById = async (maddeId, anlamId) => {
  const madde = await Gundem.updateOne(
    { _id: ObjectId(maddeId), 'whichDict.id': ObjectId(anlamId) },
    { $pull: { whichDict: { id: ObjectId(anlamId) } } },
    { upsert: true }
  );
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }

  return madde;
};

const userMaddeFavorites = async (id, anlamId, userId, method) => {
  let sonuc = null;
  if (method === 'insert') {
    sonuc = await Gundem.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $push: { 'whichDict.$.favorites': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Gundem.updateOne(
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
    sonuc = await Gundem.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $push: { 'whichDict.$.likes': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Gundem.updateOne(
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

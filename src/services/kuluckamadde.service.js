const httpStatus = require('http-status');
const assert = require('assert');
const mongoose = require('mongoose');
const { Kuluckamadde, Madde, Kuluckasection } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;

const createSubMadde = async (maddeId, maddeBody) => {
  const newmadde = maddeBody;
  newmadde.id = new ObjectId();
  const madde = await Kuluckamadde.updateOne({ _id: ObjectId(maddeId) }, { $push: { whichDict: newmadde } }, { new: true });
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
    maddeler = await Kuluckamadde.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    maddeler = await Kuluckamadde.paginate(filter, options);
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
  const maddeler = await Kuluckamadde.aggregate(agg, (cmdErr, result) => {
    assert.equal(null, cmdErr);
  });

  return maddeler;
};
const getMyModeraterMaddeEntries = async (setId) => {
  const section = await Kuluckasection.findById(setId);
  // eslint-disable-next-line no-console
  console.log('sectioned section.userAssigned.id:', JSON.stringify(section.userAssigned.id));
  const agg = [
    {
      $match: {
        'whichDict.isActive': false,
        'whichDict.isCheckedOutToMadde': false,
        'whichDict.isDelivered': true,
        'whichDict.isControlled': false,
        'whichDict.userSubmitted': ObjectId(section.userAssigned.id),
      },
    },
    {
      $unwind: {
        path: '$whichDict',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $limit: 1000,
    },
  ];
  // eslint-disable-next-line no-unused-vars
  const maddeler = await Kuluckamadde.aggregate(agg, (cmdErr, result) => {
    assert.equal(null, cmdErr);
  });

  return maddeler;
};
const getMyOwnMaddeEntries = async (userId) => {
  const agg = [
    {
      $match: {
        'whichDict.isActive': false,
        'whichDict.isCheckedOutToMadde': false,
        'whichDict.isDelivered': false,
        'whichDict.isControlled': false,
        'whichDict.userSubmitted': ObjectId(userId),
      },
    },
    {
      $unwind: {
        path: '$whichDict',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $limit: 1000,
    },
  ];
  // eslint-disable-next-line no-unused-vars
  const maddeler = await Kuluckamadde.aggregate(agg, (cmdErr, result) => {
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
  return Kuluckamadde.findById(id);
};

/**
 * Get madde by madde name
 * @param {string} madde
 * @returns {Promise<Madde>}
 */
const getMaddeByName = async (madde) => {
  return Kuluckamadde.findOne({ madde });
};

/**
 * Update madde by id
 * @param {ObjectId} maddeId
 * @param {Object} updateBody
 * @returns {Promise<Madde>}
 */
const updateMaddeById = async (maddeId, updateBody) => {
  // const madde = await getMaddeById(maddeId);
  // // eslint-disable-next-line no-console
  // console.log('MADDEID:', maddeId);
  // if (!madde) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  // }
  // if (updateBody.madde && (await Kuluckamadde.isMaddeAlrearyInDB(updateBody.madde, maddeId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Madde zaten daha önce kayıtlı');
  // }
  // Object.assign(madde, updateBody);
  // await madde.save();
  const madde = await Kuluckamadde.updateOne(
    { _id: ObjectId(maddeId) },
    {
      $set: { madde: updateBody.madde, digeryazim: updateBody.digeryazim, whichDict: updateBody.whichDict },
    },
    { new: true, upsert: true }
  );
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  return madde;
};

const mergeSubMadde = async (maddeId, updateBody) => {
  let fmadde;
  try {
    fmadde = await Kuluckamadde.findOne({ _id: ObjectId(maddeId), 'whichDict.id': ObjectId(updateBody.id) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('eroror1:', error);
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }

  const temp = [...fmadde.whichDict];
  const madde = temp.find((x) => x.id.toString() === updateBody.id.toString());
  const updatepayload = {
    anlam: madde.anlam,
    dictId: madde.dictId._id,
    tur: madde.tur,
    alttur: madde.alttur,
    tip: madde.tip,
    koken: madde.koken,
    cinsiyet: madde.cinsiyet,
    bicim: madde.bicim,
    sinif: madde.sinif,
    transkripsiyon: madde.transkripsiyon,
    fonetik: madde.fonetik,
    heceliyazim: madde.heceliyazim,
    zitanlam: madde.zitanlam,
    esanlam: madde.esanlam,
    telaffuz: madde.telaffuz,
  };
  const newpayload = {
    madde: fmadde.madde,
  };
  newpayload.whichDict = [
    {
      anlam: madde.anlam,
      dictId: madde.dictId._id,
      tur: madde.tur,
      alttur: madde.alttur,
      tip: madde.tip,
      koken: madde.koken,
      cinsiyet: madde.cinsiyet,
      bicim: madde.bicim,
      sinif: madde.sinif,
      transkripsiyon: madde.transkripsiyon,
      fonetik: madde.fonetik,
      heceliyazim: madde.heceliyazim,
      zitanlam: madde.zitanlam,
      esanlam: madde.esanlam,
      telaffuz: madde.telaffuz,
    },
  ];
  if (madde.digerMaddeId && madde.digerMaddeId._id) {
    updatepayload['whichDict.$.digerMaddeId'] = madde.digerMaddeId._id;
    newpayload['whichDict[0].digerMaddeId'] = madde.digerMaddeId._id;
  }
  if (madde.karsiMaddeId && madde.karsiMaddeId._id) {
    updatepayload['whichDict.$.karsiMaddeId'] = madde.karsiMaddeId._id;
    newpayload['whichDict[0].karsiMaddeId'] = madde.karsiMaddeId._id;
  }
  let newmadde;
  let founded;

  try {
    founded = await Madde.findOne({ madde: fmadde.madde });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('eroror2:', error);
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }

  if (founded) {
    //   // eslint-disable-next-line no-console
    //   console.log(('YENİ BULDUK', founded));

    newmadde = await Madde.updateOne(
      { madde: fmadde.madde },
      {
        $push: { whichDict: updatepayload },
      },
      { new: true, upsert: true }
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(('YENİ MADDEMİŞZ', newpayload));
    newmadde = await Madde.create(newpayload);
  }

  if (!newmadde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde Birleştirilemedi');
  }

  const gundemupdate = await Kuluckamadde.updateOne(
    { _id: ObjectId(maddeId), 'whichDict.id': ObjectId(updateBody.id) },
    {
      $set: {
        'whichDict.$.isCheckedOutToMadde': true,
        'whichDict.$.updatedAt': Date.now(),
      },
    },
    { upsert: true }
  );

  if (!gundemupdate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Gündem birleştirme sonucu güncellenemedi.');
  }
  return newmadde;
};

const updateSubMaddeById = async (maddeId, updateBody) => {
  const madde = await Kuluckamadde.updateOne(
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
        'whichDict.$.bulunduguSayfalar': updateBody.bulunduguSayfalar,
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
  const found = await Kuluckamadde.findOne({ madde: maddeBody.madde });
  let madde;
  if (found) {
    // eslint-disable-next-line no-console
    console.log('Madde:---Z', found._id);
    const payload = maddeBody.whichDict;
    // eslint-disable-next-line no-console
    console.log('Madde:---eewe', payload);
    madde = await createSubMadde(found._id, payload);
  } else {
    madde = await Kuluckamadde.create(maddeBody);
  }
  // if (await Kuluckamadde.isMaddeAlrearyInDB(maddeBody.madde)) {
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
  const madde = await Kuluckamadde.deleteOne({ _id: maddeId });
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  return madde;
};

const deleteSubMaddeById = async (maddeId, anlamId) => {
  const madde = await Kuluckamadde.updateOne(
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
    sonuc = await Kuluckamadde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $push: { 'whichDict.$.favorites': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Kuluckamadde.updateOne(
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
    sonuc = await Kuluckamadde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $push: { 'whichDict.$.likes': ObjectId(userId) } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Kuluckamadde.updateOne(
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
  mergeSubMadde,
  userMaddeLikes,
  getMyOwnMaddeEntries,
  getMyModeraterMaddeEntries,
};

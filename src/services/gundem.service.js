const httpStatus = require('http-status');
const assert = require('assert');
const mongoose = require('mongoose');
const { Gundem, Madde } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;

const mapAsync = (array, callbackfn) => {
  return Promise.all(array.map(callbackfn));
};

const karsiOnly = (row) => {
  return new Promise((res) => {
    setTimeout(async () => {
      res(
        await Promise.all(
          row.whichDict.map(
            async (whichDict) =>
              whichDict &&
              whichDict.karsi &&
              whichDict.karsi.length &&
              Promise.all(
                whichDict.karsi.map((karsi) => ({
                  digeryazim: karsi.digeryazim || [],
                  madde: karsi.madde,
                  whichDict: [
                    {
                      id: new ObjectId(),
                      anlam: whichDict.anlam,
                      dictId: whichDict.dictId,
                      tip: whichDict.tip,
                      tur: whichDict.tur,
                      dili: karsi.dili,
                      alttur: whichDict.alttur,
                      fonetik: whichDict.fonetik,
                      heceliyazim: whichDict.heceliyazim,
                      sesDosyasi: karsi.sesDosyasi,
                      cinsiyet: karsi.cinsiyet,
                      location: whichDict.location,
                      eserindili: whichDict.eserindili,
                      eserindonemi: whichDict.eserindonemi,
                      eserinyili: whichDict.eserinyili,
                      eserinyazari: whichDict.eserinyazari,
                      esertxt: whichDict.esertxt,
                      kokeni: whichDict.kokeni,
                      kokleri: whichDict.kokleri,
                      kokendili: whichDict.kokendili,
                      sozusoyleyen: whichDict.sozusoyleyen,
                      telaffuz: whichDict.telaffuz,
                      sinif: whichDict.sinif,
                      bicim: whichDict.bicim,
                      transkripsiyon: whichDict.transkripsiyon,
                      zitanlam: whichDict.zitanlam,
                      esanlam: whichDict.esanlam,
                      sekil: whichDict.sekil,
                      tarihcesi: whichDict.tarihcesi,
                      bulunduguSayfalar: whichDict.bulunduguSayfalar,
                      karsi: [
                        {
                          madde: row.madde,
                          digeryazim: row.digeryazim,
                          anlam: '',
                          dili: whichDict.dili,
                          sesDosyasi: whichDict.sesDosyasi,
                        },
                      ],
                    },
                  ],
                }))
              )
          )
        )
      );
    }, 1);
  });
};
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

const mergeSubMadde = async (maddeId, updateBody) => {
  let fmadde;
  try {
    fmadde = await Gundem.findOne({ _id: ObjectId(maddeId), 'whichDict.id': ObjectId(updateBody.id) })
      .lean()
      .exec();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('eroror1:', error);
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }

  if (fmadde) {
    const bulkOps = await Promise.all(
      [fmadde].map(async (row) => ({
        updateOne: {
          filter: { madde: row.madde },
          update: {
            $addToSet: {
              digeryazim: { $each: row.digeryazim || [] },
              whichDict: { $each: row.whichDict || [] },
            },
          },
          upsert: true,
        },
      }))
    );
    await Madde.collection
      .bulkWrite(bulkOps)
      .then((results) => results)
      .catch((error) => {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
      });
  }
  let m = await mapAsync([fmadde], karsiOnly);
  m = m.flat(Infinity).filter(Boolean);
  if (m && m.length) {
    const bulkOpsKarsi = await Promise.all(
      m.map(async (row) => ({
        updateOne: {
          filter: { madde: row.madde },
          update: {
            $addToSet: {
              digeryazim: { $each: row.digeryazim || [] },
              whichDict: { $each: row.whichDict || [] },
            },
          },
          upsert: true,
        },
      }))
    );

    // eslint-disable-next-line no-console
    await Madde.collection
      .bulkWrite(bulkOpsKarsi)
      .then((results) => results)
      .catch((error) => {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
      });
  }

  /*
  const temp = [...fmadde.whichDict];
  const madde = temp.find((x) => x.id && x.id.toString() === updateBody.id.toString());
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
  // if (madde.digerMaddeId && madde.digerMaddeId._id) {
  //   updatepayload['whichDict.$.digerMaddeId'] = madde.digerMaddeId._id;
  //   newpayload['whichDict[0].digerMaddeId'] = madde.digerMaddeId._id;
  // }
  // if (madde.karsiMaddeId && madde.karsiMaddeId._id) {
  //   updatepayload['whichDict.$.karsiMaddeId'] = madde.karsiMaddeId._id;
  //   newpayload['whichDict[0].karsiMaddeId'] = madde.karsiMaddeId._id;
  // }
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
*/

  const gundemupdate = await Gundem.updateOne(
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
  return gundemupdate;
};

const updateSubMaddeById = async (maddeId, updateBody) => {
  const madde = await Gundem.updateOne(
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
        'whichDict.$.isActive': updateBody.isActive,
        'whichDict.$.userConfirmed': updateBody.userConfirmed,
        'whichDict.$.userSubmitted': updateBody.userSubmitted,
        'whichDict.$.updatedAt': Date.now(),
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
  mergeSubMadde,
  userMaddeLikes,
};

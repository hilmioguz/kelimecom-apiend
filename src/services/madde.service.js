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

// const queryExportMaddeler = async (filter) => {
//   try {
//     // const count = await Madde.countDocuments(filter);
//     const downloadFilename = `./Maddeler-${Date.now()}.xlsx`;
//     const options = {
//       filename: downloadFilename,
//       useStyles: true,
//       useSharedStrings: true,
//     };
//     const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
//     const ws = workbook.addWorksheet('My Sheet');
//     // const batchLimit = 1000;
//     // const totalAvgCount = Math.ceil(count / batchLimit);
//     // header of excel file
//     ws.addRow([
//       'madde',
//       'digeryazim',
//       'karsi',
//       'anlam',
//       'sozluk',
//       'tip',
//       'tur',
//       'alttur',
//       'koken',
//       'cinsiyet',
//       'bicim',
//       'sinif',
//       'transkripsiyon',
//       'fonetik',
//       'heceliyazim',
//       'zitanlam',
//       'esanlam',
//       'telaffuz',
//       'girisiyapan',
//     ]).commit();
//     // eslint-disable-next-line no-console
//     // console.log('totalAvgCount:', totalAvgCount);
//     // eslint-disable-next-line camelcase
//     const table_data = await Madde.find(filter).limit(100);
//     // eslint-disable-next-line no-console
//     console.log('Table Data:', JSON.stringify(table_data, null, 2));
//     const newa = [];
//     // eslint-disable-next-line no-restricted-syntax, camelcase
//     for await (const h of table_data) {
//       h.whichDict.forEach((w) => {
//         const a = {};
//         a.madde = h.madde;
//         a.digeryazim = h.digeryazim ? h.digeryazim.join(',') : '';
//         a.karsi = w.karsi && w.karsi.length ? w.karsi.map((k) => k.madde).join(',') : '';
//         a.anlam = w.anlam;
//         a.sozluk = w.dictId.name;
//         a.tip = w.tip ? w.tip.join(',') : '';
//         a.tur = w.tur ? w.tur.join(',') : '';
//         a.alttur = w.alttur ? w.alttur.join(',') : '';
//         a.koken = w.koken ? w.koken.join(',') : '';
//         a.cinsiyet = w.cinsiyet ? w.cinsiyet.join(',') : '';
//         a.bicim = w.bicim ? w.bicim.join(',') : '';
//         a.sinif = w.sinif ? w.sinif.join(',') : '';
//         a.transkripsiyon = w.transkripsiyon ? w.transkripsiyon.join(',') : '';
//         a.fonetik = w.fonetik ? w.fonetik.join(',') : '';
//         a.heceliyazim = w.heceliyazim ? w.heceliyazim.join(',') : '';
//         a.zitanlam = w.zitanlam ? w.zitanlam.join(',') : '';
//         a.esanlam = w.esanlam ? w.esanlam.join(',') : '';
//         a.telaffuz = w.telaffuz ? w.telaffuz.join(',') : '';
//         if (w.userSubmitted) a.userSubmitted = w.userSubmitted.name;
//         newa.push(a);
//       });
//     }
//     // eslint-disable-next-line no-restricted-syntax
//     for await (const values of newa) {
//       ws.addRow([
//         values.madde || '',
//         values.digeryazim || '',
//         values.karsi || '',
//         values.anlam || '',
//         values.sozluk || '',
//         values.tip || '',
//         values.tur || '',
//         values.alttur || '',
//         values.koken || '',
//         values.cinsiyet || '',
//         values.bicim || '',
//         values.sinif || '',
//         values.transkripsiyon || '',
//         values.fonetik || '',
//         values.heceliyazim || '',
//         values.zitanlam || '',
//         values.esanlam || '',
//         values.telaffuz || '',
//         values.userSubmitted || '',
//       ]).commit();
//     }

//     // let i = 0;
//     // Total batch
//     // eslint-disable-next-line camelcase
//     // while (i < totalAvgCount) {
//     //   // eslint-disable-next-line no-await-in-loop, camelcase
//     //   const table_data = await Madde.find(filter, {
//     //     order: [['id', 'ASC']],
//     //     // eslint-disable-next-line camelcase
//     //     offset: 0,
//     //     limit: -1,
//     //   });
//     //   // eslint-disable-next-line no-console
//     //   console.log('table Data', table_data);
//     // const newa = [];
//     // table_data.forEach((h) => {
//     //   h.whichDict.forEach((w) => {
//     //     const a = {};
//     //     a.madde = h.madde;
//     //     a.digeryazim = h.digeryazim;
//     //     a.anlam = w.anlam;
//     //     a.sozluk = w.dictId.name;
//     //     a.karsi = w.karsi && w.karsi.length ? w.karsi.map((k) => k.madde).join(',') : '';
//     //     a.tip = w.tip;
//     //     a.tur = w.tur;
//     //     a.alttur = w.alttur;
//     //     a.koken = w.koken;
//     //     a.cinsiyet = w.cinsiyet;
//     //     a.bicim = w.bicim;
//     //     a.sinif = w.sinif;
//     //     a.transkripsiyon = w.transkripsiyon;
//     //     a.fonetik = w.fonetik;
//     //     a.heceliyazim = w.heceliyazim;
//     //     a.zitanlam = w.zitanlam;
//     //     a.esanlam = w.esanlam;
//     //     a.telaffuz = w.telaffuz;
//     //     if (w.userSubmitted) a.userSubmitted = w.userSubmitted.name;
//     //     newa.push(a);
//     //   });
//     // });
//     // batch  loop
//     // newa.forEach(async (values) => {
//     //   ws.addRow([
//     //     values.madde || '',
//     //     values.digeryazim || '',
//     //     values.anlam || '',
//     //     values.sozluk || '',
//     //     values.karsi || '',
//     //     values.tip || '',
//     //     values.tur || '',
//     //     values.alttur || '',
//     //     values.koken || '',
//     //     values.cinsiyet || '',
//     //     values.bicim || '',
//     //     values.sinif || '',
//     //     values.transkripsiyon || '',
//     //     values.fonetik || '',
//     //     values.heceliyazim || '',
//     //     values.zitanlam || '',
//     //     values.esanlam || '',
//     //     values.telaffuz || '',
//     //     values.userSubmitted || '',
//     //   ]).commit();
//     // });
//     // i += 1;
//     // }

//     // await workbook.commit();
//     return workbook;
//     // response shown in  json
//   } catch (error) {
//     return error;
//   }
// };

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
      { $push: { 'whichDict.$.favorites': { userId: ObjectId(userId) } } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Madde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $pull: { 'whichDict.$.favorites': { userId: ObjectId(userId) } } },
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
      { $push: { 'whichDict.$.likes': { userId: ObjectId(userId) } } },
      { new: true, upsert: true }
    );
  }
  if (method === 'delete') {
    sonuc = await Madde.updateOne(
      { _id: ObjectId(id), 'whichDict.id': ObjectId(anlamId) },
      { $pull: { 'whichDict.$.likes': { userId: ObjectId(userId) } } },
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
  // queryExportMaddeler,
};

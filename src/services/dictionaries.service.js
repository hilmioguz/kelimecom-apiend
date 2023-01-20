/* eslint-disable no-console */
const httpStatus = require('http-status');
const fetch = require('node-fetch');
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const readXlsxFile = require('read-excel-file/node');
const mongoose = require('mongoose');
const { Dictionaries, Madde, Previewmadde } = require('../models');
const ApiError = require('../utils/ApiError');

const { ObjectId } = mongoose.Types;

const sozlukSchema = {
  tip: {
    prop: 'tip',
    type: String,
  },
  anadil: {
    prop: 'kelime',
    type: String,
  },
  digeryazim: {
    prop: 'digeryazim',
    type: String,
  },
  karsidil: {
    prop: 'karsidil',
    type: String,
  },
  karsidil_diger: {
    prop: 'karsidil_digeryazim',
    type: String,
  },
  anlam: {
    prop: 'anlam',
    type: String,
  },
  kokleri: {
    prop: 'kokleri',
    type: String,
  },
  koken_dili: {
    prop: 'kokendili',
    type: String,
  },
  koken: {
    prop: 'kokeni',
    type: String,
  },
  tur: {
    prop: 'tur',
    type: String,
  },
  alt_tur: {
    prop: 'alttur',
    type: String,
  },
  cinsiyet: {
    prop: 'cinsiyet',
    type: String,
  },
  bicim: {
    prop: 'bicim',
    type: String,
  },
  sınıf: {
    prop: 'sinif',
    type: String,
  },
  transkripsiyon: {
    prop: 'transkripsiyon',
    type: String,
  },
  fonetik: {
    prop: 'fonetik',
    type: String,
  },
  heceli_yazim: {
    prop: 'heceliyazim',
    type: String,
  },
  zit_anlam: {
    prop: 'zitanlam',
    type: String,
  },
  es_anlam: {
    prop: 'esanlam',
    type: String,
  },
  eserin_dili: {
    prop: 'eserindili',
    type: String,
  },
  eserin_donemi: {
    prop: 'eserindonemi',
    type: String,
  },
  eserin_yili: {
    prop: 'eserinyili',
    type: String,
  },
  eserin_yazari: {
    prop: 'eserinyazari',
    type: String,
  },
  maps_koordinat: {
    prop: 'location',
    type: String,
  },
};

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

const getDictionaryStatById = async (id) => {
  return Madde.aggregate([
    {
      $match: {
        'whichDict.dictId': new ObjectId(id),
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: 1,
        },
      },
    },
  ]);
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

const generateTemplate = async (dictionaryId) => {
  const dictionary = await getDictionariesById(dictionaryId);
  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  if (dictionary.uploadPath && dictionary.isUploading) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await readXlsxFile(Buffer.from(fs.readFileSync(dictionary.uploadPath)), {
      schema: sozlukSchema,
      transformData(data) {
        // Remove empty rows.
        return data.filter((row) => row.filter((column) => column !== null).length > 0);
      },
    }).then(async ({ rows, errors }) => {
      // eslint-disable no-console
      console.error(errors);
      console.log(JSON.stringify(rows));
      const bulkOps = await Promise.all(
        rows.map(async (row) => ({
          updateOne: {
            filter: { madde: row.kelime },
            update: {
              $addToSet: {
                digeryazim: { $each: row.digeryazim ? row.digeryazim.split(',') : [] },
                whichDict: {
                  $each: row.anlam
                    ? [
                        {
                          id: new ObjectId(),
                          anlam: row.anlam,
                          dictId: ObjectId(dictionary.id),
                          tur: row.tur ? row.tur.split(',') : [],
                          alttur: row.alttur ? row.alttur.split(',') : [],
                          tip: row.tip ? row.tip.split(',') : [],
                          kokleri: row.kokleri || '',
                          sesDosyasi: row.sesDosyasi || '',
                          location: row.location
                            ? [row.location.split(',')[0].trim(), row.location.split(',')[1].trim()]
                            : [],
                          eserindili: row.eserindili || '',
                          eserindonemi: row.eserindonemi || '',
                          eserinyili: row.eserinyili || '',
                          eserinyazari: row.eserinyazari || '',
                          esertxt: row.esertxt || '',
                          dili: dictionary.lang,
                          kokendili: row.kokendili || '',
                          kokeni: row.kokeni || '',
                          karsi: row.karsidil
                            ? [
                                {
                                  id: new ObjectId(),
                                  madde: row.karsidil,
                                  anlam: row.anlam,
                                  digeryazim: row.karsidil_digeryazim || '',
                                  dili: dictionary.karsidil || '',
                                },
                              ]
                            : [],
                          sozusoyleyen: row.sozusoyleyen || '',
                          cinsiyet: row.cinsiyet ? row.cinsiyet.split(',') : [],
                          bicim: row.bicim ? row.bicim.split(',') : [],
                          sinif: row.sinif ? row.sinif.split(',') : [],
                          transkripsiyon: row.transkripsiyon ? row.transkripsiyon.split(',') : [],
                          fonetik: row.fonetik ? row.fonetik.split(',') : [],
                          heceliyazim: row.heceliyazim ? row.heceliyazim.split(',') : [],
                          zitanlam: row.zitanlam ? row.zitanlam.split(',') : [],
                          esanlam: row.esanlam ? row.esanlam.split(',') : [],
                          telaffuz: row.telaffuz ? row.telaffuz.split(',') : [],
                        },
                      ]
                    : [],
                },
              },
            },
            upsert: true,
          },
        }))
      );
      const result = await Previewmadde.collection
        .bulkWrite(bulkOps)
        .then((results) => results)
        .catch((error) => {
          throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        });
      // eslint-disable-next-line no-console
      console.log('Preview', JSON.stringify(result));
    });
  }
  return dictionary;
};

const completePreview = async (dictionaryId) => {
  const dictionary = await getDictionariesById(dictionaryId);
  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  // await dictionary.remove();
  try {
    const maddeler = await Previewmadde.find({}).lean().exec();
    // eslint-disable-next-line no-console
    const bulkOps = await Promise.all(
      maddeler.map(async (row) => ({
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
    const result = await Madde.collection
      .bulkWrite(bulkOps)
      .then(async (results) => {
        if (results) {
          console.log('Preview results:', JSON.stringify(results));
          await Previewmadde.deleteMany({});
          Object.assign(dictionary, { isUploading: false, uploadPath: '' });
          dictionary.save();
        }
      })
      .catch((error) => {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
      });
    console.log('1meddelet:', JSON.stringify(result));
    if (!maddeler) {
      console.log('meddelet:', JSON.stringify(maddeler));
    }
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
  getDictionaryStatById,
  generateTemplate,
  completePreview,
};

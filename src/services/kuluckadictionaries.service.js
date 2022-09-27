const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Kuluckadictionaries, Kuluckasection, Dictionaries, Kuluckamadde, Madde } = require('../models');
const ApiError = require('../utils/ApiError');

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

/**
 * Create a dictionary
 * @param {Object} dictBoddy
 * @returns {Promise<Kuluckadictionaries>}
 */
const createDictionaries = async (dictBoddy) => {
  if (await Kuluckadictionaries.isDictionariesAlrearyInDB(dictBoddy.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kuluçka Sözlük zaten tanımlı');
  }
  if (typeof dictBoddy.cilt === 'string') {
    // eslint-disable-next-line no-param-reassign
    dictBoddy.cilt = JSON.parse(dictBoddy.cilt);
  }

  const dictionary = await Kuluckadictionaries.create(dictBoddy);
  // eslint-disable-next-line no-param-reassign
  dictBoddy._id = dictionary.id;
  await Dictionaries.create(dictBoddy);
  if (dictionary && dictionary.id) {
    const { cilt, sectionedBy, azureUrl, imageFilenameSytanx } = dictBoddy;
    if (cilt && sectionedBy && azureUrl && imageFilenameSytanx) {
      const chunked = [];
      let urlString = azureUrl;
      if (azureUrl.slice(-1) !== '/') {
        urlString = `${azureUrl}/`;
      }
      let pageNumber = 0;

      cilt.forEach((cildim) => {
        const total = [...Array(Number(cildim.end) - Number(cildim.start) + 1).keys()].map((x) => x + Number(cildim.start));
        // eslint-disable-next-line no-console
        console.log('total:', JSON.stringify(total));
        // eslint-disable-next-line array-callback-return
        Array.from({ length: Math.ceil(total.length / sectionedBy) }, (val, i) => {
          const number = total.slice(i * sectionedBy, i * sectionedBy + sectionedBy);
          const url = number.map((item) => urlString + imageFilenameSytanx.replace('*', item));
          pageNumber += 1;
          // eslint-disable-next-line no-console
          console.log('NU BERRR:', JSON.stringify(number), JSON.stringify(url));

          const name = `${pageNumber}.SET`;
          chunked.push({ url, name, order: pageNumber });
        });
      });

      chunked.forEach(async (chunk) => {
        const sectionPayload = {
          dictId: dictionary.id,
          name: chunk.name,
          totalPages: chunk.url.length,
          pages: chunk.url,
          order: chunk.order,
        };
        try {
          await Kuluckasection.create(sectionPayload);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('ERRORORO--->', error);
        }
      });
    }
  }
  return dictionary;
};

const getDictionaryStatById = async (id) => {
  return Kuluckamadde.aggregate([
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
 * Query for a dictionary
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDictionaries = async (filter, options) => {
  const dictionaries = await Kuluckadictionaries.paginate(filter, options);
  return dictionaries;
};

/**
 * Get dictionary by id
 * @param {ObjectId} id
 * @returns {Promise<Kuluckadictionaries>}
 */
const getDictionariesById = async (id) => {
  return Kuluckadictionaries.findById(id);
};

const getDictionaryCheckExistanceById = async (id) => {
  let isExist = await Dictionaries.findById(id).lean().exec();
  if (!isExist) {
    const body = await Kuluckadictionaries.findById(id).lean().exec();
    isExist = await Dictionaries.create(body);
  }
  // eslint-disable-next-line no-console
  console.log('isExist final:', isExist);
  return isExist;
};

const combine = async (id) => {
  const kuluckalar = await Kuluckamadde.find({ 'whichDict.dictId': new ObjectId(id) })
    .lean()
    .exec();
  // eslint-disable-next-line no-console
  const bulkOps = await Promise.all(
    kuluckalar.map(async (row) => ({
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
    .then((results) => results)
    .catch((error) => {
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    });

  const kuluckalarK = await Kuluckamadde.find({ 'whichDict.dictId': new ObjectId(id) })
    .lean()
    .exec();

  let m = await mapAsync(kuluckalarK, karsiOnly);
  m = m.flat(Infinity).filter(Boolean);

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
  return result;
};
/**
 * Get dictionary by name
 * @param {string} name
 * @returns {Promise<Kuluckadictionaries>}
 */
const getDictionariesByName = async (name) => {
  return Kuluckadictionaries.findOne({ name });
};

/**
 * Update dictionary by id
 * @param {ObjectId} dictionaryId
 * @param {Object} updateBody
 * @returns {Promise<Kuluckadictionaries>}
 */
const updateDictionariesById = async (dictionaryId, updateBody) => {
  const dictionary = await getDictionariesById(dictionaryId);
  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kuluçka Sözlük bulunamadı');
  }
  if (updateBody.dictionary && (await Kuluckadictionaries.isDictionariesAlrearyInDB(updateBody.name, dictionaryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kuluçka Sözlük zaten daha önce kayıtlı');
  }
  if (typeof updateBody.cilt === 'string') {
    // eslint-disable-next-line no-param-reassign
    updateBody.cilt = JSON.parse(updateBody.cilt);
  }

  Object.assign(dictionary, updateBody);
  await dictionary.save();
  return dictionary;
};

/**
 * Delete dictionary by id
 * @param {ObjectId} dictionaryId
 * @returns {Promise<Kuluckadictionaries>}
 */
const deleteDictionariesById = async (dictionaryId) => {
  const dictionary = await getDictionariesById(dictionaryId);
  if (!dictionary) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kuluçka Sözlük bulunamadı');
  }
  await dictionary.remove();
  const sections = Kuluckasection.find({ dictId: dictionaryId });
  await sections.remove();
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
  getDictionaryCheckExistanceById,
  combine,
};

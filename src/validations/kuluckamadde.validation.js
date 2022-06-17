const Joi = require('joi');
const { objectId } = require('./custom.validation');

const whichDictSchema = {
  anlam: Joi.string(),
  dictId: Joi.required().custom(objectId),
  karsiMaddeId: Joi.custom(objectId).optional(),
  alttur: Joi.array().items(Joi.string()).optional(),
  tur: Joi.array().items(Joi.string()).optional(),
  tip: Joi.array().items(Joi.string()).optional(),
  kokleri: Joi.array().items(Joi.string()).optional(),
  cinsiyet: Joi.array().items(Joi.string()).optional(),
  bicim: Joi.array().items(Joi.string()).optional(),
  sinif: Joi.array().items(Joi.string()).optional(),
  transkripsiyon: Joi.array().items(Joi.string()).optional(),
  fonetik: Joi.array().items(Joi.string()).optional(),
  heceliyazim: Joi.array().items(Joi.string()).optional(),
  zitanlam: Joi.array().items(Joi.string()).optional(),
  esanlam: Joi.array().items(Joi.string()).optional(),
  telaffuz: Joi.array().items(Joi.string()).optional(),
  bulunduguSayfalar: Joi.string().required(),
  userSubmitted: Joi.required().custom(objectId),
  userConfirmed: Joi.string().custom(objectId).optional(),
  isCheckedOutToMadde: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  isDelivered: Joi.boolean().optional(),
  isControlled: Joi.boolean().optional(),
  sesDosyasi: Joi.string().empty().allow('').optional(),
  eserindili: Joi.string().optional(),
  eserindonemi: Joi.string().optional(),
  eserinyili: Joi.string().optional(),
  esertxt: Joi.string().optional(),
  eserinyazari: Joi.string().optional(),
  dili: Joi.string().optional(),
  kokendili: Joi.string().optional(),
  kokeni: Joi.string().optional(),
  sozusoyleyen: Joi.string().optional(),
  kuluckaSectionId: Joi.required().custom(objectId),
  location: Joi.array().ordered(Joi.number().min(-180).max(180).optional(), Joi.number().min(-90).max(90).optional()),
  karsi: Joi.array()
    .items(
      Joi.object().keys({
        dili: Joi.string(),
        madde: Joi.string(),
        anlam: Joi.string().optional(),
        sesDosyasi: Joi.string().empty().allow('').optional(),
        digeryazim: Joi.array().items(Joi.string().empty().allow('').optional()).optional(),
      })
    )
    .optional(),
  sekil: Joi.array()
    .items(
      Joi.object().keys({
        aciklama: Joi.string(),
        url: Joi.string(),
      })
    )
    .optional(),
  tarihcesi: Joi.array()
    .items(
      Joi.object().keys({
        baslangic: Joi.string(),
        bitis: Joi.string(),
        adi: Joi.string(),
        hakimiyet: Joi.string(),
      })
    )
    .optional(),
};

const createMadde = {
  body: Joi.object().keys({
    madde: Joi.string(),
    digeryazim: Joi.array().items(Joi.string().empty().optional()).optional(),
    whichDict: Joi.array().min(1).items(Joi.object(whichDictSchema)).required(),
  }),
};

const createSubMadde = {
  body: Joi.object().keys(whichDictSchema),
};

const mergeSubMadde = {
  params: Joi.object().keys({
    maddeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      id: Joi.required().custom(objectId),
    })
    .min(1),
};

const getMaddeler = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    sort: Joi.string().optional(),
    pagination: Joi.string().optional(),
  }),
};

const getMaddeByName = {
  params: Joi.object().keys({
    madde: Joi.string(),
  }),
};

const getMaddeById = {
  params: Joi.object().keys({
    maddeId: Joi.string().custom(objectId),
  }),
};

const updateMadde = {
  params: Joi.object().keys({
    maddeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      madde: Joi.string(),
      digeryazim: Joi.array().items(Joi.string().empty().optional()).optional(),
      whichDict: Joi.array().min(1).items(Joi.object(whichDictSchema)).required(),
    })
    .min(1),
};

const updateHeadOnlyMadde = {
  params: Joi.object().keys({
    maddeId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      madde: Joi.string().required(),
    })
    .min(1),
};

const updateSubMadde = {
  params: Joi.object().keys({
    maddeId: Joi.required().custom(objectId),
    anlamId: Joi.string().optional(),
  }),
  body: Joi.object().keys({
    id: Joi.required().custom(objectId),
    digeryazim: Joi.array().items(Joi.string().empty().optional()).optional(),
    anlam: Joi.string(),
    dictId: Joi.required().custom(objectId),
    karsiMaddeId: Joi.custom(objectId).optional(),
    alttur: Joi.array().items(Joi.string()).optional(),
    tur: Joi.array().items(Joi.string()).optional(),
    tip: Joi.array().items(Joi.string()).optional(),
    kokleri: Joi.array().items(Joi.string()).optional(),
    cinsiyet: Joi.array().items(Joi.string()).optional(),
    bicim: Joi.array().items(Joi.string()).optional(),
    sinif: Joi.array().items(Joi.string()).optional(),
    transkripsiyon: Joi.array().items(Joi.string()).optional(),
    fonetik: Joi.array().items(Joi.string()).optional(),
    heceliyazim: Joi.array().items(Joi.string()).optional(),
    zitanlam: Joi.array().items(Joi.string()).optional(),
    esanlam: Joi.array().items(Joi.string()).optional(),
    telaffuz: Joi.array().items(Joi.string()).optional(),
    bulunduguSayfalar: Joi.string().required(),
    userSubmitted: Joi.required().custom(objectId),
    userConfirmed: Joi.string().custom(objectId).optional(),
    isCheckedOutToMadde: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    isDelivered: Joi.boolean().optional(),
    isControlled: Joi.boolean().optional(),
    sesDosyasi: Joi.string().empty().allow('').optional(),
    eserindili: Joi.string().optional(),
    eserindonemi: Joi.string().optional(),
    eserinyili: Joi.string().optional(),
    eserinyazari: Joi.string().optional(),
    esertxt: Joi.string().optional(),
    dili: Joi.string().optional(),
    kokendili: Joi.string().optional(),
    kokeni: Joi.string().optional(),
    sozusoyleyen: Joi.string().optional(),
    kuluckaSectionId: Joi.required().custom(objectId),
    location: Joi.array().ordered(Joi.number().min(-180).max(180).optional(), Joi.number().min(-90).max(90).optional()),
    karsi: Joi.array()
      .items(
        Joi.object().keys({
          dili: Joi.string(),
          madde: Joi.string(),
          anlam: Joi.string().empty().allow('').optional(),
          sesDosyasi: Joi.string().empty().allow('').optional(),
          digeryazim: Joi.array().items(Joi.string().empty().allow('').optional()).optional(),
        })
      )
      .optional(),
    sekil: Joi.array()
      .items(
        Joi.object().keys({
          aciklama: Joi.string(),
          url: Joi.string(),
        })
      )
      .optional(),
    tarihcesi: Joi.array()
      .items(
        Joi.object().keys({
          baslangic: Joi.string(),
          bitis: Joi.string(),
          adi: Joi.string(),
          hakimiyet: Joi.string(),
        })
      )
      .optional(),
  }),
};

const deleteSubMadde = {
  params: Joi.object().keys({
    maddeId: Joi.required().custom(objectId),
    anlamId: Joi.required().custom(objectId),
  }),
};

const userMaddeFavorites = {
  body: Joi.object().keys({
    maddeId: Joi.string().required().custom(objectId),
    anlamId: Joi.string().required().custom(objectId),
    method: Joi.string().required(),
  }),
};

const userMaddeLikes = {
  body: Joi.object().keys({
    maddeId: Joi.string().required().custom(objectId),
    anlamId: Joi.string().required().custom(objectId),
    method: Joi.string().required(),
  }),
};

const deleteMadde = {
  params: Joi.object().keys({
    maddeId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createMadde,
  getMaddeler,
  createSubMadde,
  getMaddeById,
  updateHeadOnlyMadde,
  getMaddeByName,
  updateMadde,
  deleteMadde,
  mergeSubMadde,
  deleteSubMadde,
  updateSubMadde,
  userMaddeFavorites,
  userMaddeLikes,
};

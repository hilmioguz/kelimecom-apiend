const Joi = require('joi');
const { objectId } = require('./custom.validation');

const whichDictSchema = {
  anlam: Joi.string(),
  dictId: Joi.required().custom(objectId),
  digeryazim: Joi.string().empty().optional(),
  digerMaddeId: Joi.custom(objectId).optional(),
  karsiMaddeId: Joi.custom(objectId).optional(),
  alttur: Joi.array().items(Joi.string()).optional(),
  tur: Joi.array().items(Joi.string()).optional(),
  tip: Joi.array().items(Joi.string()).optional(),
  koken: Joi.array().items(Joi.string()).optional(),
  cinsiyet: Joi.array().items(Joi.string()).optional(),
  bicim: Joi.array().items(Joi.string()).optional(),
  sinif: Joi.array().items(Joi.string()).optional(),
  transkripsiyon: Joi.array().items(Joi.string()).optional(),
  fonetik: Joi.array().items(Joi.string()).optional(),
  heceliyazim: Joi.array().items(Joi.string()).optional(),
  zitanlam: Joi.array().items(Joi.string()).optional(),
  esanlam: Joi.array().items(Joi.string()).optional(),
  telaffuz: Joi.array().items(Joi.string()).optional(),
  userSubmitted: Joi.required().custom(objectId),
  userConfirmed: Joi.string().custom(objectId).optional(),
  isCheckedOutToMadde: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
};

const createMadde = {
  body: Joi.object().keys({
    madde: Joi.string(),
    whichDict: Joi.array().min(1).items(Joi.object(whichDictSchema)).required(),
  }),
};

const createSubMadde = {
  body: Joi.object().keys(whichDictSchema),
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
    anlam: Joi.string(),
    dictId: Joi.required().custom(objectId),
    digerMaddeId: Joi.custom(objectId).optional(),
    karsiMaddeId: Joi.custom(objectId).optional(),
    alttur: Joi.array().items(Joi.string()).optional(),
    tur: Joi.array().items(Joi.string()).optional(),
    tip: Joi.array().items(Joi.string()).optional(),
    koken: Joi.array().items(Joi.string()).optional(),
    cinsiyet: Joi.array().items(Joi.string()).optional(),
    bicim: Joi.array().items(Joi.string()).optional(),
    sinif: Joi.array().items(Joi.string()).optional(),
    transkripsiyon: Joi.array().items(Joi.string()).optional(),
    fonetik: Joi.array().items(Joi.string()).optional(),
    heceliyazim: Joi.array().items(Joi.string()).optional(),
    zitanlam: Joi.array().items(Joi.string()).optional(),
    esanlam: Joi.array().items(Joi.string()).optional(),
    telaffuz: Joi.array().items(Joi.string()).optional(),
    userSubmitted: Joi.required().custom(objectId),
    userConfirmed: Joi.string().custom(objectId).optional(),
    isCheckedOutToMadde: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
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
  deleteSubMadde,
  updateSubMadde,
  userMaddeFavorites,
  userMaddeLikes,
};

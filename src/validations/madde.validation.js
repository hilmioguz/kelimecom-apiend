const Joi = require('joi');
const { objectId } = require('./custom.validation');

const whichDictSchema = {
  anlam: Joi.string(),
  dictId: Joi.required().custom(objectId),
};

const createMadde = {
  body: Joi.object().keys({
    madde: Joi.string(),
    whichDict: Joi.array().min(1).items(Joi.object(whichDictSchema)).required(),
    tur: Joi.array().items(Joi.string()),
    tip: Joi.array().items(Joi.string()),
    koken: Joi.array().items(Joi.string()),
    cinsiyet: Joi.array().items(Joi.string()),
    bicim: Joi.array().items(Joi.string()),
    sinif: Joi.array().items(Joi.string()),
    transkripsiyon: Joi.array().items(Joi.string()),
    fonetik: Joi.array().items(Joi.string()),
    heceliyazim: Joi.array().items(Joi.string()),
    zitanlam: Joi.array().items(Joi.string()),
    esanlam: Joi.array().items(Joi.string()),
    telaffuz: Joi.array().items(Joi.string()),
  }),
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
    })
    .min(1),
};

const deleteMadde = {
  params: Joi.object().keys({
    maddeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createMadde,
  getMaddeler,
  getMaddeById,
  getMaddeByName,
  updateMadde,
  deleteMadde,
};

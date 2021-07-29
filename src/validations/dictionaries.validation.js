const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDictionary = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string(),
    lang: Joi.string(),
    desc: Joi.string(),
    shortDesc: Joi.string(),
    isBidirectional: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
};

const getDictionaries = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    sortBy: Joi.array().optional(),
    sortDesc: Joi.array().optional(),
    itemsPerPage: Joi.number().optional(),
    page: Joi.number().optional(),
    perpage: Joi.number().optional(),
  }),
};

const getDictionaryById = {
  params: Joi.object().keys({
    dictId: Joi.string().custom(objectId),
  }),
};

const getDictionaryByName = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateDictionary = {
  params: Joi.object().keys({
    dictId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      code: Joi.string(),
      lang: Joi.string(),
      desc: Joi.string(),
      shortDesc: Joi.string(),
      isActive: Joi.boolean(),
      isBidirectional: Joi.boolean(),
    })
    .min(1),
};

const deleteDictionary = {
  params: Joi.object().keys({
    dictId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDictionary,
  getDictionaries,
  getDictionaryById,
  getDictionaryByName,
  updateDictionary,
  deleteDictionary,
};

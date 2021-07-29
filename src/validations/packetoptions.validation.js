const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOption = {
  body: Joi.object().keys({
    packetId: Joi.required().custom(objectId),
    name: Joi.string().required(),
    desc: Joi.string(),
    limitValue: Joi.number(),
    isIncluded: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
};

const getOptions = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    sort: Joi.string().optional(),
    pagination: Joi.string().optional(),
  }),
};

const getOptionById = {
  params: Joi.object().keys({
    optionId: Joi.string().custom(objectId),
  }),
};
const getOptionsByPacketId = {
  params: Joi.object().keys({
    packetId: Joi.string().custom(objectId),
  }),
};
const getOptionByName = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateOption = {
  params: Joi.object().keys({
    optionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      packetId: Joi.required().custom(objectId),
      name: Joi.string().required(),
      desc: Joi.string(),
      limitValue: Joi.number(),
      isActive: Joi.boolean(),
      isIncluded: Joi.boolean(),
    })
    .min(1),
};

const deleteOption = {
  params: Joi.object().keys({
    optionId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createOption,
  getOptions,
  getOptionById,
  getOptionsByPacketId,
  getOptionByName,
  updateOption,
  deleteOption,
};

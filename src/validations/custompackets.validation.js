const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCustom = {
  body: Joi.object().keys({
    packetId: Joi.required().custom(objectId),
    name: Joi.string().required(),
  }),
};

const getCustoms = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    sort: Joi.string().optional(),
    pagination: Joi.string().optional(),
  }),
};

const getCustomById = {
  params: Joi.object().keys({
    customId: Joi.string().custom(objectId),
  }),
};
const getCustomsByPacketId = {
  params: Joi.object().keys({
    packetId: Joi.string().custom(objectId),
  }),
};
const getCustomByName = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateCustom = {
  params: Joi.object().keys({
    customId: Joi.required().custom(objectId),
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

const deleteCustom = {
  params: Joi.object().keys({
    customId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCustom,
  getCustoms,
  getCustomById,
  getCustomsByPacketId,
  getCustomByName,
  updateCustom,
  deleteCustom,
};

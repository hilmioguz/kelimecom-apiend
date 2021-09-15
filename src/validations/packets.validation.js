const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPacket = {
  body: Joi.object().keys({
    name: Joi.string(),
    isActive: Joi.boolean(),
  }),
};

const getPackets = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPacketByName = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

const getPacketById = {
  params: Joi.object().keys({
    packetId: Joi.string().custom(objectId),
  }),
};

const updatePacket = {
  params: Joi.object().keys({
    packetId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deletePacket = {
  params: Joi.object().keys({
    packetId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPacket,
  getPackets,
  getPacketById,
  getPacketByName,
  updatePacket,
  deletePacket,
};

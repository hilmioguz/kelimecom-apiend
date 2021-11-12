const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPacket = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    role: Joi.string().required(),
    maddebasi: Joi.object().keys({ limitlessCount: Joi.number(), limitLater: Joi.number() }),
    cekim: Joi.object().keys({ limitlessCount: Joi.number(), limitLater: Joi.number() }),
    anlam: Joi.object().keys({ limitlessCount: Joi.number(), limitLater: Joi.number() }),
    dictLimit: Joi.number(),
    allowedDicts: Joi.array(),
    langLimit: Joi.number(),
    allowedLangs: Joi.array(),
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
      name: Joi.string().required(),
      role: Joi.string().required(),
      maddebasi: Joi.object().keys({ limitlessCount: Joi.number(), limitLater: Joi.number() }),
      cekim: Joi.object().keys({ limitlessCount: Joi.number(), limitLater: Joi.number() }),
      anlam: Joi.object().keys({ limitlessCount: Joi.number(), limitLater: Joi.number() }),
      dictLimit: Joi.number(),
      allowedDicts: Joi.array(),
      langLimit: Joi.number(),
      allowedLangs: Joi.array(),
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

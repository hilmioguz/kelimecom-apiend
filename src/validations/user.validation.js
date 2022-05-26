const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    googleId: Joi.any(),
    email: Joi.string().required().email(),
    password: Joi.alternatives().conditional('googleId', {
      is: Joi.exist(),
      then: Joi.any(),
      otherwise: Joi.string().required().custom(password),
    }),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'moderater', 'admin'),
    clientIp: Joi.string().optional(),
    picture: Joi.string().empty().optional(),
    isEmailVerified: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    canDoKulucka: Joi.boolean().optional(),
    canDoKuluckaModerate: Joi.boolean().optional(),
    paketBegin: Joi.string().optional(),
    paketEnd: Joi.string().optional(),
    kurumId: Joi.string().custom(objectId),
    packetId: Joi.string().custom(objectId),
    assignedSet: Joi.string().optional(),
  }),
};

const createMassUser = {
  body: Joi.object().keys({
    role: Joi.string().required().valid('user', 'moderater', 'admin'),
    users: Joi.array().required().min(1),
    password: Joi.string().required(),
    paketBegin: Joi.string().required(),
    paketEnd: Joi.string().required(),
    kurumId: Joi.string().custom(objectId).required(),
    paketId: Joi.string().custom(objectId).required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    sort: Joi.string().optional(),
    pagination: Joi.string().optional(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string().optional(),
      role: Joi.string().optional(),
      picture: Joi.string().optional(),
      isEmailVerified: Joi.boolean().optional(),
      isActive: Joi.boolean().optional(),
      canDoKulucka: Joi.boolean().optional(),
      canDoKuluckaModerate: Joi.boolean().optional(),
      paketBegin: Joi.string().optional(),
      paketEnd: Joi.string().optional(),
      kurumId: Joi.string().custom(objectId),
      packetId: Joi.string().custom(objectId),
      assignedSet: Joi.string().optional(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createMassUser,
};

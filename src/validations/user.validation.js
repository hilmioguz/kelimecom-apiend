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
    role: Joi.string().required().valid('user', 'admin'),
    clientIp: Joi.string().optional(),
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
      name: Joi.string(),
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
};

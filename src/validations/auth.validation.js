const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    password2: Joi.string().required().custom(password),
    name: Joi.string().required(),
    clientIp: Joi.string().optional(),
  }),
};

const registerGoogle = {
  body: Joi.object().keys({
    sub: Joi.string().required(),
    name: Joi.string().optional(),
    email: Joi.string().required(),
    given_name: Joi.string().optional(),
    family_name: Joi.string().optional(),
    packetId: Joi.string().optional(),
    locale: Joi.string().optional(),
    email_verified: Joi.boolean().optional(),
    picture: Joi.string().optional(),
    clientIp: Joi.string().optional(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const loginGoogle = {
  body: Joi.object().keys({
    googleId: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    password2: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};
const editPassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    token: Joi.string().required(),
  }),
};
const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};
module.exports = {
  register,
  registerGoogle,
  login,
  loginGoogle,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  editPassword,
};

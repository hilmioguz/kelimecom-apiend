const Joi = require('joi');

const createInvitation = {
  body: Joi.object().keys({
    invitedBy: Joi.string(),
    email: Joi.string().required().email(),
    invitedByIp: Joi.string(),
  }),
};

module.exports = {
  createInvitation,
};

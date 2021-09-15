const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createKurum = {
  body: Joi.object().keys({
    institution_name: Joi.string(),
    cidr: Joi.array(),
    isActive: Joi.boolean(),
    mail_suffix: Joi.string(),
    beginDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

const getKurumlar = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getKurumByName = {
  params: Joi.object().keys({
    institution_name: Joi.string(),
  }),
};

const getKurumById = {
  params: Joi.object().keys({
    kurumId: Joi.string().custom(objectId),
  }),
};

const updateKurum = {
  params: Joi.object().keys({
    kurumId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      institution_name: Joi.string(),
    })
    .min(1),
};

const deleteKurum = {
  params: Joi.object().keys({
    kurumId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createKurum,
  getKurumlar,
  getKurumById,
  getKurumByName,
  updateKurum,
  deleteKurum,
};

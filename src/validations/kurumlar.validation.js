const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createKurum = {
  body: Joi.object().keys({
    institution_name: Joi.string(),
    cidr: Joi.array(),
    isActive: Joi.boolean(),
    mail_suffix: Joi.string(),
    beginDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    address: Joi.string().optional(),
    contact: Joi.string().optional(),
    contactEmail: Joi.string().optional(),
    ipBlockRef: Joi.string().optional(),
    logoImage: Joi.string().optional(),
    phone: Joi.string().optional(),
    status: Joi.string().optional(),
  }),
};

const queryKurumlar = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
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
      cidr: Joi.array(),
      isActive: Joi.boolean(),
      mail_suffix: Joi.string(),
      beginDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      address: Joi.string().optional(),
      contact: Joi.string().optional(),
      contactEmail: Joi.string().optional(),
      ipBlockRef: Joi.string().optional(),
      logoImage: Joi.string().optional(),
      phone: Joi.string().optional(),
      status: Joi.string().optional(),
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
  queryKurumlar,
  getKurumById,
  getKurumByName,
  updateKurum,
  deleteKurum,
};

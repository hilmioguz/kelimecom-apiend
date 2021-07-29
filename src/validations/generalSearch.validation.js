const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createKelimeler = {
  body: Joi.object().keys({
    name: Joi.string(),
  }),
};

const getKelimeler = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    sort: Joi.string().optional(),
    pagination: Joi.string().optional(),
  }),
};

const getRawKelimeler = {
  body: Joi.object().keys({
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
    searchTerm: Joi.string(),
    searchType: Joi.string().optional(),
    searchFilter: Joi.object().keys({
      dil: Joi.string().optional(),
      tip: Joi.string().optional(),
      sozluk: Joi.string().optional(),
      filterOrders: Joi.string().optional(),
    }),
  }),
};

const getKelimeById = {
  params: Joi.object().keys({
    maddeId: Joi.string().custom(objectId),
  }),
};

const getKelimeByMadde = {
  params: Joi.object().keys({
    madde: Joi.string(),
    code: Joi.string().optional(),
    tip: Joi.string().optional(),
  }),
};

module.exports = {
  createKelimeler,
  getKelimeler,
  getKelimeById,
  getRawKelimeler,
  getKelimeByMadde,
};

const Joi = require('joi');

const createSiteLanguage = {
  body: Joi.object().keys({
    value: Joi.string().required(),
    title: Joi.object().keys({
      en: Joi.string().required(),
      tr: Joi.string().required(),
    }),
    order: Joi.number().optional(),
    isActive: Joi.boolean(),
  }),
};

const getSiteLanguages = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSiteLanguageByName = {
  params: Joi.object().keys({
    value: Joi.string(),
  }),
};

const getSiteLanguageById = {
  params: Joi.object().keys({
    value: Joi.string(),
  }),
};

const updateSiteLanguage = {
  params: Joi.object().keys({
    value: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      value: Joi.string().required(),
      title: Joi.object().keys({
        en: Joi.string().required(),
        tr: Joi.string().required(),
      }),
      order: Joi.number().optional(),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteSiteLanguage = {
  params: Joi.object().keys({
    value: Joi.string(),
  }),
};

module.exports = {
  createSiteLanguage,
  getSiteLanguages,
  getSiteLanguageById,
  getSiteLanguageByName,
  updateSiteLanguage,
  deleteSiteLanguage,
};

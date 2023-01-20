const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDictionary = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string(),
    lang: Joi.string(),
    karsidil: Joi.string(),
    anlamLang: Joi.string(),
    desc: Joi.string(),
    isActive: Joi.boolean(),
    isUploading: Joi.boolean().optional(),
    uploadPath: Joi.string().optional(),
    apa_cevirmen: Joi.string().optional(),
    apa_sozluk_ismi: Joi.string().optional(),
    apa_yazar_tarih: Joi.string().optional(),
    cms_basim_yeri: Joi.string().optional(),
    cms_cevirmen: Joi.string().optional(),
    cms_sozluk_ismi: Joi.string().optional(),
    cms_tarih_siteadi: Joi.string().optional(),
    cms_yazar: Joi.string().optional(),
    mla_cevirmen: Joi.string().optional(),
    mla_sozluk_ismi: Joi.string().optional(),
    mla_tarih_siteadi: Joi.string().optional(),
    mla_yazar: Joi.string().optional(),
  }),
};

const getDictionaries = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
    isUploading: Joi.boolean().optional(),
    sortBy: Joi.array().optional(),
    sortDesc: Joi.array().optional(),
    itemsPerPage: Joi.number().optional(),
    page: Joi.number().optional(),
    perpage: Joi.number().optional(),
  }),
};

const getDictionaryById = {
  params: Joi.object().keys({
    dictId: Joi.string().custom(objectId),
  }),
};

const getDictionaryByName = {
  params: Joi.object().keys({
    name: Joi.string(),
  }),
};

const updateDictionary = {
  params: Joi.object().keys({
    dictId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      code: Joi.string().optional(),
      lang: Joi.string().optional(),
      karsidil: Joi.string(),
      anlamLang: Joi.string().optional(),
      desc: Joi.string().optional(),
      isActive: Joi.boolean().optional(),
      isUploading: Joi.boolean().optional(),
      uploadPath: Joi.string().optional(),
      apa_cevirmen: Joi.string().optional(),
      apa_sozluk_ismi: Joi.string().optional(),
      apa_yazar_tarih: Joi.string().optional(),
      cms_basim_yeri: Joi.string().optional(),
      cms_cevirmen: Joi.string().optional(),
      cms_sozluk_ismi: Joi.string().optional(),
      cms_tarih_siteadi: Joi.string().optional(),
      cms_yazar: Joi.string().optional(),
      mla_cevirmen: Joi.string().optional(),
      mla_sozluk_ismi: Joi.string().optional(),
      mla_tarih_siteadi: Joi.string().optional(),
      mla_yazar: Joi.string().optional(),
    })
    .min(1),
};

const deleteDictionary = {
  params: Joi.object().keys({
    dictId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDictionary,
  getDictionaries,
  getDictionaryById,
  getDictionaryByName,
  updateDictionary,
  deleteDictionary,
};

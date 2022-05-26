const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDictionary = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string(),
    lang: Joi.string(),
    anlamLang: Joi.string(),
    desc: Joi.string(),
    isActive: Joi.boolean(),
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
    cilt: Joi.string().required(),
    azureUrl: Joi.string().optional(),
    imageFilenameSytanx: Joi.string().optional(),
    sectionedBy: Joi.number().optional(),
    toplamSayfa: Joi.number().optional(),
    bitenSayfa: Joi.number().optional(),
    yazar: Joi.string().optional(),
    coverImage: Joi.string().optional(),
    hakkindaBlogUrl: Joi.string().optional(),
    hangiAsama: Joi.number().optional(),
    isSectionCreated: Joi.boolean().optional(),
  }),
};

const getDictionaries = {
  query: Joi.object().keys({
    query: Joi.string().optional(),
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
      name: Joi.string(),
      code: Joi.string(),
      lang: Joi.string(),
      anlamLang: Joi.string(),
      desc: Joi.string(),
      isActive: Joi.boolean(),
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
      cilt: Joi.string().required(),
      azureUrl: Joi.string().optional(),
      imageFilenameSytanx: Joi.string().optional(),
      sectionedBy: Joi.number().optional(),
      toplamSayfa: Joi.number().optional(),
      bitenSayfa: Joi.number().optional(),
      yazar: Joi.string().optional(),
      coverImage: Joi.string().optional(),
      hakkindaBlogUrl: Joi.string().optional(),
      hangiAsama: Joi.number().optional(),
      isSectionCreated: Joi.boolean().optional(),
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

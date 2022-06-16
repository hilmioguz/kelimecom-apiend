const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { siteLanguageService } = require('../services');

const createSiteLanguage = catchAsync(async (req, res) => {
  const lang = await siteLanguageService.createSiteLanguage(req.body);
  res.status(httpStatus.CREATED).send(lang);
});

const getSiteLanguages = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['isActive']);
  options.sortBy = 'order';
  options.sortDesc = -1;
  const result = await siteLanguageService.querySiteLanguages(filter, options);
  res.send(result);
});

const getSiteLanguageById = catchAsync(async (req, res) => {
  const lang = await siteLanguageService.getSiteLanguageById(req.params.value);
  if (!lang) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SiteLanguage bulunamadı');
  }
  res.send(lang);
});

const getSiteLanguageByName = catchAsync(async (req, res) => {
  const lang = await siteLanguageService.getSiteLanguageByName(req.params.value);
  if (!lang) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SiteLanguage bulunamadı');
  }
  res.send(lang);
});

const updateSiteLanguage = catchAsync(async (req, res) => {
  const lang = await siteLanguageService.updateSiteLanguageById(req.params.value, req.body);
  res.send(lang);
});

const deleteSiteLanguage = catchAsync(async (req, res) => {
  await siteLanguageService.deleteSiteLanguageById(req.params.value);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSiteLanguage,
  getSiteLanguages,
  getSiteLanguageById,
  getSiteLanguageByName,
  updateSiteLanguage,
  deleteSiteLanguage,
};

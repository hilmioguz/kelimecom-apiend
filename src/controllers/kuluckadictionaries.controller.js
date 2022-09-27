const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { kuluckadictionaryService } = require('../services');

const createDictionary = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.createDictionaries(req.body);
  res.status(httpStatus.CREATED).send(dict);
});

const getDictionaries = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name', 'code', 'lang', 'dictId']);
  const result = await kuluckadictionaryService.queryDictionaries(filter, options);
  res.send(result);
});

const getDictionaryById = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.getDictionariesById(req.params.dictId);
  if (!dict) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  res.send(dict);
});

const getDictionaryStatById = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.getDictionaryStatById(req.params.dictId);
  if (!dict) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  // eslint-disable-next-line prettier/prettier, dot-notation
  res.send(dict[0]);
});

const getDictionaryByName = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.getDictionariesByName(req.params.name);
  if (!dict) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  res.send(dict);
});

const getDictionaryCheckExistanceById = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.getDictionaryCheckExistanceById(req.params.dictId);
  res.send(dict);
});

const combine = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.combine(req.params.dictId);
  res.send(dict);
});

const updateDictionary = catchAsync(async (req, res) => {
  const dict = await kuluckadictionaryService.updateDictionariesById(req.params.dictId, req.body);
  res.send(dict);
});

const deleteDictionary = catchAsync(async (req, res) => {
  await kuluckadictionaryService.deleteDictionariesById(req.params.dictId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDictionary,
  getDictionaries,
  getDictionaryById,
  getDictionaryByName,
  updateDictionary,
  deleteDictionary,
  getDictionaryStatById,
  getDictionaryCheckExistanceById,
  combine,
};

const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { dictionaryService } = require('../services');

const createDictionary = catchAsync(async (req, res) => {
  const dict = await dictionaryService.createDictionaries(req.body);
  res.status(httpStatus.CREATED).send(dict);
});

const getDictionaries = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name', 'code', 'lang']);
  const result = await dictionaryService.queryDictionaries(filter, options);
  res.send(result);
});

const getDictionaryById = catchAsync(async (req, res) => {
  const dict = await dictionaryService.getDictionariesById(req.params.dictId);
  if (!dict) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  res.send(dict);
});

const getDictionaryByName = catchAsync(async (req, res) => {
  const dict = await dictionaryService.getDictionariesByName(req.params.name);
  if (!dict) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sözlük bulunamadı');
  }
  res.send(dict);
});

const updateDictionary = catchAsync(async (req, res) => {
  const dict = await dictionaryService.updateDictionariesById(req.params.dictId, req.body);
  res.send(dict);
});

const deleteDictionary = catchAsync(async (req, res) => {
  await dictionaryService.deleteDictionariesById(req.params.dictId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDictionary,
  getDictionaries,
  getDictionaryById,
  getDictionaryByName,
  updateDictionary,
  deleteDictionary,
};

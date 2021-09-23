/* eslint-disable no-console */
const httpStatus = require('http-status');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const prefilter = require('../utils/prefilter');
const catchAsync = require('../utils/catchAsync');
const { searchService } = require('../services');

const creatKelimeler = catchAsync(async (req, res) => {
  const packet = await searchService.createKelimeler(req.body);
  res.status(httpStatus.CREATED).send(packet);
});

const getKelimeler = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log('body:', req.body);
  let body = '';
  if (req.params.madde) {
    body = { query: req.params.madde };
  } else {
    body = req.body;
  }
  const { filter, options } = prefilter(body, ['madde']);
  const result = await searchService.queryKelimeler(filter, options);
  res.send(result);
});

const getRawKelimeler = catchAsync(async (req, res) => {
  console.log('params:', req.params);
  console.log('body:', req.body);
  console.log('query:', req.query);

  let aranantext = decodeURIComponent(req.body.searchTerm);
  console.log('aranantext:', aranantext);
  aranantext = aranantext.replace(/\?/g, '.');
  aranantext = aranantext.replace(/\*/g, '.*.');
  aranantext = aranantext.replace(/٭/g, '.*.');
  aranantext = aranantext.replace(/؟/g, '.');

  if (req.body.searchType === 'advanced') {
    aranantext = aranantext.trim();
    aranantext = aranantext.replace(/\[/g, '(');
    aranantext = aranantext.replace(/\]/g, ')');
    aranantext = aranantext.replace(/,/g, '|');
    aranantext = aranantext.replace(/،/g, '|');
  } else {
    aranantext = aranantext.replace(/\[.*\]/g, '');
  }

  const options = {};
  options.searchTerm = aranantext;
  options.searchType = req.body.searchType;
  options.searchFilter = req.body.searchFilter;
  options.limit = req.body.limit || 10;
  options.page = req.body.page || 1;
  // if (req.user) {
  //   options.limit = req.body.limit || 10;
  //   options.page = req.body.page;
  // } else {
  //   options.limit =
  //     // eslint-disable-next-line no-nested-ternary
  //     req.body.searchType === 'advanced' || req.body.searchType === 'exactwithdash' || req.body.searchType === 'maddeanlam'
  //       ? req.body.limit
  //       : req.body.searchType === 'exact'
  //       ? 30
  //       : 7;
  //   options.page = req.body.page;
  // }
  // eslint-disable-next-line no-console
  console.log('options:', options);

  const result = await searchService.rawQueryKelimeler(options);
  res.send(result);
});

const getKelimeById = catchAsync(async (req, res) => {
  const madde = await searchService.getKelimeById(req.params.maddeId, req.params.dictId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const getKelimeByMadde = catchAsync(async (req, res) => {
  let aranantext = req.params.madde;
  const arananId = req.params.id;
  const { dil, tip, sozluk } = req.params;

  aranantext = aranantext.replace(/\?/g, '.?');
  aranantext = aranantext.replace(/\*/g, '.*');
  const options = {};
  options.searchId = arananId;
  options.searchTerm = aranantext;
  options.searchType = req.body.type;
  options.searchFilter = req.body.searchFilter;
  options.searchDil = dil;
  options.searchTip = tip;
  options.searchDict = sozluk;

  if (req.user) {
    options.limit = req.body.limit || 10;
    options.page = req.body.page;
  } else {
    options.limit = req.body.searchType === 'advanced' ? req.body.limit : 7;
  }
  // eslint-disable-next-line no-console
  console.log('options:', options);

  const madde = await searchService.getKelimeByMadde(options);

  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const getMaddeByRandom = catchAsync(async (req, res) => {
  const options = {};
  options.limit = 1;
  options.searchType = 'random';

  let randomnum = 1;
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    randomnum = await fs.readFileSync(`${__dirname}/../randomMadde.txt`, 'utf8');
    console.log(randomnum);
  } catch (err) {
    console.error(err);
  }
  options.skip = Number(randomnum);
  // eslint-disable-next-line no-console
  console.log('options:', options);

  const madde = await searchService.getKelimeByMadde(options);

  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

module.exports = {
  creatKelimeler,
  getKelimeler,
  getKelimeByMadde,
  getMaddeByRandom,
  getRawKelimeler,
  getKelimeById,
};

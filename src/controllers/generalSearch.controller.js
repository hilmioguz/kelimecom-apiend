/* eslint-disable no-console */
const httpStatus = require('http-status');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const prefilter = require('../utils/prefilter');
const catchAsync = require('../utils/catchAsync');
const { searchService, searchstatService } = require('../services');

const creatKelimeler = catchAsync(async (req, res) => {
  const packet = await searchService.createKelimeler(req.body);
  res.status(httpStatus.CREATED).send(packet);
});

const getKelimeler = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log('params:', req.params);
  console.log('body:', req.body);
  console.log('query:', req.query);
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

const updateDigeryazim = catchAsync(async (req, res) => {
  const result = await searchService.updateDigeryazim();
  res.send(result);
});

const getRawKelimeler = catchAsync(async (req, res) => {
  console.log('params:', req.params);
  console.log('body:', req.body);
  console.log('query:', req.query);

  let aranantext = decodeURIComponent(req.body.searchTerm);
  aranantext = aranantext.replace(/\?/g, '.');
  aranantext = aranantext.replace(/\*/g, '.*.');
  aranantext = aranantext.replace(/٭/g, '.*.');
  aranantext = aranantext.replace(/؟/g, '.');

  // if (req.body.searchType === 'advanced') {
  aranantext = aranantext.trim();
  aranantext = aranantext.replace(/\[/g, '(');
  aranantext = aranantext.replace(/\]/g, ')');
  aranantext = aranantext.replace(/,/g, '|');
  aranantext = aranantext.replace(/،/g, '|');
  // } else {
  aranantext = aranantext.replace(/\[.*\]/g, '');
  // }

  const options = {};
  options.searchTerm = aranantext;
  options.searchType = req.body.searchType;
  options.searchFilter = req.body.searchFilter;
  options.limit = req.body.limit || 10;
  options.page = req.body.page || 1;
  options.isUserActive = req.body.isUserActive || false; // Kullanıcı aktifse tüm whichDict kayıtlarını getir
  const payload = {};

  if (options.searchType !== 'exactwithdash' && options.searchType !== 'maddeanlam') {
    payload.searchTerm = decodeURIComponent(req.body.searchTerm);
    payload.searchType = options.searchType;
    // IP adresini al: önce req.clientIp, sonra req.params.clientIp, sonra req.ip, en son headers'dan
    payload.clientIp = req.clientIp || req.params.clientIp || req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || '';
    payload.secilenDil = options.searchFilter.dil;
    payload.secilenTip = options.searchFilter.tip;
    // userId: req.user varsa id'sini al (mongoose'da hem _id hem id çalışır)
    payload.userId = req.user && (req.user.id || req.user._id) ? (req.user.id || req.user._id) : null;
    // kurumId: req.user.kurumId varsa al (ObjectId veya populate edilmiş object olabilir)
    payload.kurumId = req.user && req.user.kurumId ? (req.user.kurumId._id || req.user.kurumId) : null;
  }

  const result = await searchService.rawQueryKelimeler(options);
  if (options.searchType !== 'exactwithdash' && options.searchType !== 'maddeanlam') {
    payload.isInDict = !!(result && result.meta && result.meta.total > 0);
    searchstatService.createSearchstat(payload);
  }
  
  // Handle undefined result
  if (!result) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Arama sonucu alınamadı');
  }
  
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
  let aranantext = decodeURIComponent(req.params.madde);
  const arananId = req.params.id;
  const { dil, tip, sozluk } = req.params;

  aranantext = aranantext.replace(/\?/g, '.?');
  aranantext = aranantext.replace(/\*/g, '.*');
  const options = {};
  options.searchId = arananId;
  options.searchTerm = aranantext;
  options.searchType = req.body.type || 'kelime';
  options.searchFilter = req.body.searchFilter;
  options.searchDil = dil;
  options.searchTip = tip;
  options.searchDict = sozluk;
  const payload = {};

  if (options.searchType !== 'exactwithdash' && options.searchType !== 'maddeanlam') {
    payload.searchTerm = decodeURIComponent(req.params.madde);
    payload.searchType = options.searchType;
    // IP adresini al: önce req.clientIp, sonra req.params.clientIp, sonra req.ip, en son headers'dan
    payload.clientIp = req.clientIp || req.params.clientIp || req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || '';
    payload.secilenDil = dil;
    payload.secilenTip = tip;
    payload.secilenSozluk = sozluk;
    // userId: req.user varsa id'sini al (mongoose'da hem _id hem id çalışır)
    payload.userId = req.user && (req.user.id || req.user._id) ? (req.user.id || req.user._id) : null;
    // kurumId: req.user.kurumId varsa al (ObjectId veya populate edilmiş object olabilir)
    payload.kurumId = req.user && req.user.kurumId ? (req.user.kurumId._id || req.user.kurumId) : null;
  }

  if (req.user) {
    options.limit = req.body.limit || 10;
    options.page = req.body.page;
  } else {
    options.limit = req.body.searchType === 'advanced' ? req.body.limit : 7;
  }
  // eslint-disable-next-line no-console
  console.log('options:', options);

  const madde = await searchService.getKelimeByMadde(options);
  if (options.searchType !== 'exactwithdash' && options.searchType !== 'maddeanlam') {
    payload.isInDict = !!(madde && madde.meta.total > 0);
    searchstatService.createSearchstat(payload);
  }
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }

  res.send(madde);
});

const getKelimeByMaddeExceptItself = catchAsync(async (req, res) => {
  let aranantext = req.params.madde;
  const arananId = req.params.id;
  const { dil } = req.params;

  aranantext = aranantext.replace(/\?/g, '.?');
  aranantext = aranantext.replace(/\*/g, '.*');
  const options = {};
  options.searchId = arananId;
  options.searchTerm = aranantext;
  options.searchType = req.body.type;
  options.searchFilter = req.body.searchFilter;
  options.searchDil = dil;
  // options.searchTip = tip;
  // options.searchDict = sozluk;
  options.limit = 100;

  // eslint-disable-next-line no-console
  // console.log('options:', options);

  const madde = await searchService.getKelimeByMaddeExceptItself(options);
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
    const fileContent = await fs.readFileSync(`${__dirname}/../randomMadde.txt`, 'utf8');
    randomnum = parseInt(fileContent.trim());
    
    // Geçersiz sayı kontrolü
    if (isNaN(randomnum) || randomnum < 1 || randomnum > 10000) {
      randomnum = Math.floor(Math.random() * 1000) + 1;
    }
  } catch (err) {
    console.error('randomMadde.txt dosyası okunamadı:', err.message);
    // Dosya okunamazsa rastgele bir sayı üret
    randomnum = Math.floor(Math.random() * 1000) + 1;
  }
  
  options.skip = Number(randomnum);
  console.log('Random madde options:', options);

  const madde = await searchService.getKelimeByMadde(options);

  if (!madde || !madde.data || madde.data.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Rastgele madde bulunamadı');
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
  updateDigeryazim,
  getKelimeByMaddeExceptItself,
};

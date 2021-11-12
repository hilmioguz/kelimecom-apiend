const moment = require('moment');
const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { gundemService } = require('../services');

const todaystart = moment().startOf('day');
const todayend = moment().endOf('day');
const yesterdaystart = moment().subtract(1, 'day').startOf('day');
const yesterdayend = moment().subtract(1, 'day').endOf('day');

const createMadde = catchAsync(async (req, res) => {
  const madde = await gundemService.createMadde(req.body);
  res.status(httpStatus.CREATED).send(madde);
});

const createSubMadde = catchAsync(async (req, res) => {
  const madde = await gundemService.createSubMadde(req.params.maddeId, req.body);
  res.status(httpStatus.CREATED).send(madde);
});

const getMaddeler = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet']);
  const result = await gundemService.queryMaddeler(filter, options);
  res.send(result);
});

const getMaddeAll = catchAsync(async (req, res) => {
  const { zfilter, options } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet', 'isActive']);
  // eslint-disable-next-line no-console
  console.log('filter:', JSON.stringify(zfilter));
  let filter = {};
  if (zfilter) {
    filter = zfilter;
  }

  filter['whichDict.isActive'] = true;
  options.sortBy = 'updatedAt';
  options.sortDesc = -1;
  const result = await gundemService.queryMaddeler(filter, options);
  res.send(result);
});

const getMaddeDun = catchAsync(async (req, res) => {
  const { zfilter, options } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet', 'isActive']);
  // eslint-disable-next-line no-console
  console.log('filter:', JSON.stringify(zfilter));
  let filter = {};
  if (zfilter) {
    filter = zfilter;
  }
  filter['whichDict.isActive'] = true;
  filter['whichDict.updatedAt'] = { $gte: yesterdaystart, $lt: yesterdayend };
  options.sortBy = 'updatedAt';
  options.sortDesc = -1;
  const result = await gundemService.queryMaddeler(filter, options);
  res.send(result);
});

const getMaddeBugun = catchAsync(async (req, res) => {
  const { zfilter, options } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet', 'isActive']);
  // eslint-disable-next-line no-console
  console.log('filter:', JSON.stringify(zfilter));
  let filter = {};
  if (zfilter) {
    filter = zfilter;
  }
  filter['whichDict.isActive'] = true;
  filter['whichDict.updatedAt'] = { $gte: todaystart, $lt: todayend };
  options.sortBy = 'updatedAt';
  options.sortDesc = -1;
  const result = await gundemService.queryMaddeler(filter, options);
  res.send(result);
});

const getRawMaddeler = catchAsync(async (req, res) => {
  const filter = req.body.searchTerm;
  const result = await gundemService.rawQueryMaddeler(filter);
  res.send(result);
});

const getMaddeById = catchAsync(async (req, res) => {
  const madde = await gundemService.getMaddeById(req.params.maddeId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const getMaddeByName = catchAsync(async (req, res) => {
  const madde = await gundemService.getMaddeByName(req.params.madde);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const updateMadde = catchAsync(async (req, res) => {
  const madde = await gundemService.updateMaddeById(req.params.maddeId, req.body);
  res.send(madde);
});

const updateSubMadde = catchAsync(async (req, res) => {
  const madde = await gundemService.updateSubMaddeById(req.params.maddeId, req.body);
  res.send(madde);
});

const deleteMadde = catchAsync(async (req, res) => {
  await gundemService.deleteMaddeById(req.params.maddeId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteSubMadde = catchAsync(async (req, res) => {
  await gundemService.deleteSubMaddeById(req.params.maddeId, req.params.anlamId);
  res.status(httpStatus.NO_CONTENT).send();
});

const userMaddeFavorites = catchAsync(async (req, res) => {
  if (req.user) {
    const madde = await gundemService.userMaddeFavorites(req.body.maddeId, req.body.anlamId, req.user.id, req.body.method);
    res.send(madde);
  } else {
    throw new ApiError(httpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Not authorized. You must login first!');
  }
});

const userMaddeLikes = catchAsync(async (req, res) => {
  if (req.user) {
    const madde = await gundemService.userMaddeLikes(req.body.maddeId, req.body.anlamId, req.user.id, req.body.method);
    res.send(madde);
  } else {
    throw new ApiError(httpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Not authorized. You must login first!');
  }
});

module.exports = {
  createMadde,
  createSubMadde,
  getMaddeler,
  getRawMaddeler,
  getMaddeById,
  getMaddeByName,
  updateMadde,
  getMaddeAll,
  getMaddeDun,
  getMaddeBugun,
  updateSubMadde,
  deleteMadde,
  deleteSubMadde,
  userMaddeFavorites,
  userMaddeLikes,
};

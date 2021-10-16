const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { maddeService } = require('../services');

const createMadde = catchAsync(async (req, res) => {
  const madde = await maddeService.createMadde(req.body);
  res.status(httpStatus.CREATED).send(madde);
});

const getMaddeler = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet']);
  const result = await maddeService.queryMaddeler(filter, options);
  res.send(result);
});

const getRawMaddeler = catchAsync(async (req, res) => {
  const filter = req.body.searchTerm;
  const result = await maddeService.rawQueryMaddeler(filter);
  res.send(result);
});

const getMaddeById = catchAsync(async (req, res) => {
  const madde = await maddeService.getMaddeById(req.params.maddeId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const getMaddeByName = catchAsync(async (req, res) => {
  const madde = await maddeService.getMaddeByName(req.params.madde);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const updateMadde = catchAsync(async (req, res) => {
  const madde = await maddeService.updateMaddeById(req.params.maddeId, req.body);
  res.send(madde);
});

const deleteMadde = catchAsync(async (req, res) => {
  await maddeService.deleteMaddeById(req.params.maddeId);
  res.status(httpStatus.NO_CONTENT).send();
});

const userMaddeFavorites = catchAsync(async (req, res) => {
  if (req.user) {
    const madde = await maddeService.userMaddeFavorites(req.body.maddeId, req.body.anlamId, req.user.id, req.body.method);
    res.send(madde);
  } else {
    throw new ApiError(httpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Not authorized. You must login first!');
  }
});

const userMaddeLikes = catchAsync(async (req, res) => {
  if (req.user) {
    const madde = await maddeService.userMaddeLikes(req.body.maddeId, req.body.anlamId, req.user.id, req.body.method);
    res.send(madde);
  } else {
    throw new ApiError(httpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Not authorized. You must login first!');
  }
});

module.exports = {
  createMadde,
  getMaddeler,
  getRawMaddeler,
  getMaddeById,
  getMaddeByName,
  updateMadde,
  deleteMadde,
  userMaddeFavorites,
  userMaddeLikes,
};

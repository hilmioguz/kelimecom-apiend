const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { kurumlarService } = require('../services');

const createKurum = catchAsync(async (req, res) => {
  const kurumlar = await kurumlarService.createKurum(req.body);
  res.status(httpStatus.CREATED).send(kurumlar);
});

const getKurumlar = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name']);
  const result = await kurumlarService.queryKurumlar(filter, options);
  res.send(result);
});

const getKurumById = catchAsync(async (req, res) => {
  const kurumlar = await kurumlarService.getKurumById(req.params.kurumId);
  if (!kurumlar) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kurum bulunamadı');
  }
  res.send(kurumlar);
});

const getKurumByName = catchAsync(async (req, res) => {
  const kurumlar = await kurumlarService.getKurumByName(req.params.name);
  if (!kurumlar) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kurum bulunamadı');
  }
  res.send(kurumlar);
});

const updateKurum = catchAsync(async (req, res) => {
  const kurumlar = await kurumlarService.updateKurumById(req.params.kurumId, req.body);
  res.send(kurumlar);
});

const deleteKurum = catchAsync(async (req, res) => {
  await kurumlarService.deleteKurumById(req.params.kurumId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createKurum,
  getKurumlar,
  getKurumById,
  getKurumByName,
  updateKurum,
  deleteKurum,
};

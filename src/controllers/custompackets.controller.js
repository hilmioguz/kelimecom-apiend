const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { customPacketService } = require('../services');

const createCustom = catchAsync(async (req, res) => {
  const option = await customPacketService.createCustom(req.body);
  res.status(httpStatus.CREATED).send(option);
});

const getCustoms = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name']);
  const result = await customPacketService.queryCustoms(filter, options);
  res.send(result);
});

const getCustomById = catchAsync(async (req, res) => {
  const option = await customPacketService.getCustomById(req.params.optionId);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom paket bulunamadı');
  }
  res.send(option);
});

const getCustomsByPacketId = catchAsync(async (req, res) => {
  const option = await customPacketService.getCustomsByPacketId(req.params.packetId);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom Paket bulunamadı');
  }
  res.send(option);
});

const getCustomByName = catchAsync(async (req, res) => {
  const option = await customPacketService.getCustomByName(req.params.option);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom paket bulunamadı');
  }
  res.send(option);
});

const updateCustom = catchAsync(async (req, res) => {
  const option = await customPacketService.updateCustomById(req.params.optionId, req.body);
  res.send(option);
});

const deleteCustom = catchAsync(async (req, res) => {
  await customPacketService.deleteCustomById(req.params.optionId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCustom,
  getCustoms,
  getCustomById,
  getCustomsByPacketId,
  getCustomByName,
  updateCustom,
  deleteCustom,
};

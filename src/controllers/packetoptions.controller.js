const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { packetOptionService } = require('../services');

const createOption = catchAsync(async (req, res) => {
  const option = await packetOptionService.createOption(req.body);
  res.status(httpStatus.CREATED).send(option);
});

const getOptions = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name']);
  const result = await packetOptionService.queryOptions(filter, options);
  res.send(result);
});

const getOptionById = catchAsync(async (req, res) => {
  const option = await packetOptionService.getOptionById(req.params.optionId);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Opsiyon bulunamadı');
  }
  res.send(option);
});

const getOptionsByPacketId = catchAsync(async (req, res) => {
  const option = await packetOptionService.getOptionsByPacketId(req.params.packetId);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Paket Opsiyonları bulunamadı');
  }
  res.send(option);
});

const getOptionByName = catchAsync(async (req, res) => {
  const option = await packetOptionService.getOptionByName(req.params.option);
  if (!option) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Option bulunamadı');
  }
  res.send(option);
});

const updateOption = catchAsync(async (req, res) => {
  const option = await packetOptionService.updateOptionById(req.params.optionId, req.body);
  res.send(option);
});

const deleteOption = catchAsync(async (req, res) => {
  await packetOptionService.deleteOptionById(req.params.optionId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createOption,
  getOptions,
  getOptionById,
  getOptionsByPacketId,
  getOptionByName,
  updateOption,
  deleteOption,
};

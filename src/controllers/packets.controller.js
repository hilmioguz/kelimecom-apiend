const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { packetService } = require('../services');

const createPacket = catchAsync(async (req, res) => {
  const packet = await packetService.createPacket(req.body);
  res.status(httpStatus.CREATED).send(packet);
});

const getPackets = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name']);
  const result = await packetService.queryPackets(filter, options);
  res.send(result);
});

const getPacketById = catchAsync(async (req, res) => {
  const packet = await packetService.getPacketById(req.params.packetId);
  if (!packet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Packet bulunamadı');
  }
  res.send(packet);
});

const getPacketByName = catchAsync(async (req, res) => {
  const packet = await packetService.getPacketByName(req.params.name);
  if (!packet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Packet bulunamadı');
  }
  res.send(packet);
});

const updatePacket = catchAsync(async (req, res) => {
  const packet = await packetService.updatePacketById(req.params.packetId, req.body);
  res.send(packet);
});

const deletePacket = catchAsync(async (req, res) => {
  await packetService.deletePacketById(req.params.packetId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPacket,
  getPackets,
  getPacketById,
  getPacketByName,
  updatePacket,
  deletePacket,
};

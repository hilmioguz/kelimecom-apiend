const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { guestService } = require('../services');

const createGuest = catchAsync(async (req, res) => {
  const guest = await guestService.createGuest(req.body);
  res.status(httpStatus.CREATED).send(guest);
});

const getGuests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['ipAddress', 'searchCount']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await guestService.queryGuests(filter, options);
  res.send(result);
});

const getGuestById = catchAsync(async (req, res) => {
  const guest = await guestService.getGuestById(req.params.guestId);
  if (!guest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Guest bulunamadı');
  }
  res.send(guest);
});

const getGuestByIpAddress = catchAsync(async (req, res) => {
  const guest = await guestService.getGuestByIpAddress(req.params.ipAddress);
  if (!guest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Guest bulunamadı');
  }
  res.send(guest);
});

const updateGuest = catchAsync(async (req, res) => {
  const guest = await guestService.updateGuestById(req.params.guestId, req.body);
  res.send(guest);
});

const deleteGuest = catchAsync(async (req, res) => {
  await guestService.deleteGuestById(req.params.guestId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createGuest,
  getGuests,
  getGuestById,
  getGuestByIpAddress,
  updateGuest,
  deleteGuest,
};

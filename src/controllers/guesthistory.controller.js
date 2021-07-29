const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { guestHistoryService } = require('../services');

const createHistory = catchAsync(async (req, res) => {
  const history = await guestHistoryService.createHistory(req.body);
  res.status(httpStatus.CREATED).send(history);
});

const getHistories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['arananMadde', 'kullanılanYer', 'dil', 'sozluk', 'guestId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await guestHistoryService.queryHistories(filter, options);
  res.send(result);
});

const getHistoryById = catchAsync(async (req, res) => {
  const history = await guestHistoryService.getHistoryById(req.params.historyId);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History bulunamadı');
  }
  res.send(history);
});

const getHistoryByGuestId = catchAsync(async (req, res) => {
  const history = await guestHistoryService.getHistoryById(req.params.guestId);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History bulunamadı');
  }
  res.send(history);
});

const getHistoryByMadde = catchAsync(async (req, res) => {
  const history = await guestHistoryService.getHistoryByMadde(req.params.madde);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History bulunamadı');
  }
  res.send(history);
});

const deleteHistory = catchAsync(async (req, res) => {
  await guestHistoryService.deleteHistoryById(req.params.historyId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createHistory,
  getHistories,
  getHistoryById,
  getHistoryByGuestId,
  getHistoryByMadde,
  deleteHistory,
};

const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userHistoryService } = require('../services');

const createHistory = catchAsync(async (req, res) => {
  const history = await userHistoryService.createHistory(req.body);
  res.status(httpStatus.CREATED).send(history);
});

const getHistories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['arananMadde', 'kullanılanYer', 'dil', 'sozluk', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userHistoryService.queryHistories(filter, options);
  res.send(result);
});

const getHistoryById = catchAsync(async (req, res) => {
  const history = await userHistoryService.getHistoryById(req.params.historyId);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History bulunamadı');
  }
  res.send(history);
});

const getHistoryByUserId = catchAsync(async (req, res) => {
  const history = await userHistoryService.getHistoryById(req.params.userId);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History bulunamadı');
  }
  res.send(history);
});

const getHistoryByMadde = catchAsync(async (req, res) => {
  const history = await userHistoryService.getHistoryByMadde(req.params.madde);
  if (!history) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History bulunamadı');
  }
  res.send(history);
});

const deleteHistory = catchAsync(async (req, res) => {
  await userHistoryService.deleteHistoryById(req.params.historyId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createHistory,
  getHistories,
  getHistoryById,
  getHistoryByUserId,
  getHistoryByMadde,
  deleteHistory,
};

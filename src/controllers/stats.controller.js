const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { searchstatService } = require('../services');

const getStats = catchAsync(async (req, res) => {
  const { lang } = req.query;
  const latest = await searchstatService.latestByLang(lang);
  const most = await searchstatService.mostByLang(lang);
  const inserted = await searchstatService.lastAddedGundem(lang);
  res.status(httpStatus.CREATED).send({ latest, most, inserted });
});

const allStats = catchAsync(async (req, res) => {
  const stat = await searchstatService.allStats();
  res.status(httpStatus.CREATED).send(stat);
});

module.exports = {
  getStats,
  allStats,
};

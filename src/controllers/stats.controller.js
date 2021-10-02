const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { searchstatService } = require('../services');

const getStats = catchAsync(async (req, res) => {
  const { lang } = req.query;
  const latest = await searchstatService.latestByLang(lang);
  const most = await searchstatService.mostByLang(lang);

  res.status(httpStatus.CREATED).send({ latest, most });
});

module.exports = {
  getStats,
};

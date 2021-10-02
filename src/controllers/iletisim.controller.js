const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { emailService } = require('../services');

const sendContactMessage = catchAsync(async (req, res) => {
  const issent = await emailService.sendContactMessage(req.body);
  res.status(httpStatus.CREATED).send(issent);
});

module.exports = {
  sendContactMessage,
};

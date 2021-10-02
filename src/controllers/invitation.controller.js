const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { invitationService } = require('../services');

const createInvitation = catchAsync(async (req, res) => {
  const invitee = await invitationService.createInvitation(req.body);
  res.status(httpStatus.CREATED).send(invitee);
});

module.exports = {
  createInvitation,
};

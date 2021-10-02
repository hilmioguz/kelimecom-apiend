const httpStatus = require('http-status');
const { Invitation } = require('../models');
const ApiError = require('../utils/ApiError');
const { emailService } = require('.');
/**
 * Create a guest invitation for the given by user
 * @param {Object} inviationBody
 * @returns {Promise<Invitation>}
 */
const createInvitation = async (inviationBody) => {
  if (await Invitation.isInviteeAlrearyInDB(inviationBody.email)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Davet yapmak istediğiniz eposta adresine son 15 gün içerisinde başka bir davetiye zaten gönderilmiş veya şahıs halihazırda kullanıcımızdır.'
    );
  }
  try {
    await emailService.sendInvitation(inviationBody.email, inviationBody.invitedBy);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
  const invited = await Invitation.create(inviationBody);
  return invited;
};

module.exports = {
  createInvitation,
};

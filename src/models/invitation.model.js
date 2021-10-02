const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');
const subDays = require('date-fns/subDays');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const User = require('./user.model');

const invitationSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    invitedBy: {
      type: String,
    },
    invitedByIp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
invitationSchema.plugin(toJSON);
invitationSchema.plugin(paginate);

/**
 * Check if invited person ip is already in Db in the two week period
 * @param {string} email - The given invited person's email address
 * @returns {Promise<boolean>}
 */
invitationSchema.statics.isInviteeAlrearyInDB = async function (email) {
  const today = new Date();
  const twoweeks = subDays(today, 15);

  const invited = await this.findOne({
    email,
    createdAt: {
      $gte: startOfDay(twoweeks),
      $lte: endOfDay(today),
    },
  });

  const user = await User.findOne({ email });
  return !!invited || !!user;
};

/**
 * @typedef Invitation
 */
const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;

const endOfDay = require('date-fns/endOfDay');
const startOfDay = require('date-fns/startOfDay');

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const guestSchema = mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    searchCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
guestSchema.plugin(toJSON);
guestSchema.plugin(paginate);

/**
 * Check if guest ip is already in Db in the same day
 * @param {string} ipAddress - The given guest's ipaddress
 * @param {ObjectId} [excludeGuestId] - The id of the guest to be excluded
 * @returns {Promise<boolean>}
 */
guestSchema.statics.isGuestAlrearyInDB = async function (ipAddress, excludeGuestId) {
  const guest = await this.findOne({
    ipAddress,
    _id: { $ne: excludeGuestId },
    createdAt: {
      $gte: startOfDay(new Date()),
      $lte: endOfDay(new Date()),
    },
  });
  return !!guest;
};

/**
 * @typedef Guest
 */
const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;

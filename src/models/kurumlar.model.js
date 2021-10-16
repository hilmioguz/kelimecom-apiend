const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const kurumlarSchema = mongoose.Schema(
  {
    institution_name: {
      type: String,
    },
    address: {
      type: String,
    },
    beginDate: {
      type: Date,
    },
    cidr: {
      type: [String],
    },
    contact: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    endDate: {
      type: Date,
    },
    ipBlockRef: {
      type: String,
    },
    isActive: {
      type: Boolean,
    },
    status: {
      type: String,
      default: '',
    },
    logoImage: {
      type: String,
    },
    mail_suffix: {
      type: String,
    },
    phone: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'kurumlar',
  }
);

// add plugin that converts mongoose to json
kurumlarSchema.plugin(toJSON);
kurumlarSchema.plugin(paginate);

/**
 * Check if kurum is already in Db
 * @param {string} name - The given kurum's name
 * @param {ObjectId} [excludeKurumId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
kurumlarSchema.statics.isKurumAlrearyInDB = async function (name, excludeKurumId) {
  const kurum = await this.findOne({ name, _id: { $ne: excludeKurumId } });
  return !!kurum;
};

/**
 * @typedef Kurumlar
 */
const Kurumlar = mongoose.model('Kurumlar', kurumlarSchema);

module.exports = Kurumlar;

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const packetsSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    role: {
      type: String,
    },
    langLimit: {
      type: Number,
    },
    allowedLangs: {
      type: Array,
    },
    dictLimit: {
      type: Number,
    },
    allowedDicts: {
      type: Array,
    },
    maddebasi: {
      limitlessCount: {
        type: Number,
      },
      limitLater: {
        type: Number,
      },
    },
    cekim: {
      limitlessCount: {
        type: Number,
      },
      limitLater: {
        type: Number,
      },
    },
    anlam: {
      limitlessCount: {
        type: Number,
      },
      limitLater: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
packetsSchema.plugin(toJSON);
packetsSchema.plugin(paginate);

/**
 * Check if packet is already in Db
 * @param {string} name - The given packet's name
 * @param {ObjectId} [excludePacketId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
packetsSchema.statics.isPacketAlrearyInDB = async function (name, excludePacketId) {
  const packet = await this.findOne({ name, _id: { $ne: excludePacketId } });
  return !!packet;
};

/**
 * @typedef Packets
 */
const Packets = mongoose.model('Packets', packetsSchema);

module.exports = Packets;

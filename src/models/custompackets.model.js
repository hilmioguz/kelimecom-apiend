const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const customPacketsSchema = mongoose.Schema(
  {
    packetId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Packets',
      autopopulate: true,
    },
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
customPacketsSchema.plugin(toJSON);
customPacketsSchema.plugin(paginate);
customPacketsSchema.plugin(autopop);

/**
 * Check if option is already in Db
 * @param {string} body - The given packet's option name
 * @param {ObjectId} [excludeOptionId] - The id of the option to be excluded
 * @returns {Promise<boolean>}
 */
customPacketsSchema.statics.isOptionAlreadyInDB = async function (body, excludeOptionId) {
  let option = null;
  if (body && body.packetId) {
    option = await this.findOne({ name: body.name, packetId: body.packetId, _id: { $ne: excludeOptionId } });
  } else {
    option = await this.findOne({ name: body.name, _id: { $ne: excludeOptionId } });
  }
  return !!option;
};

/**
 * @typedef Custompackets
 */
const Custompackets = mongoose.model('Custompackets', customPacketsSchema);

module.exports = Custompackets;

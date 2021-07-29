const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const packetOptionsSchema = mongoose.Schema(
  {
    packetId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Packets',
      autopopulate: true,
    },
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    limitValue: {
      type: Number,
    },
    isIncluded: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
packetOptionsSchema.plugin(toJSON);
packetOptionsSchema.plugin(paginate);
packetOptionsSchema.plugin(autopop);

/**
 * Check if option is already in Db
 * @param {string} body - The given packet's option name
 * @param {ObjectId} [excludeOptionId] - The id of the option to be excluded
 * @returns {Promise<boolean>}
 */
packetOptionsSchema.statics.isOptionAlreadyInDB = async function (body, excludeOptionId) {
  let option = null;
  if (body && body.packetId) {
    option = await this.findOne({ name: body.name, packetId: body.packetId, _id: { $ne: excludeOptionId } });
  } else {
    option = await this.findOne({ name: body.name, _id: { $ne: excludeOptionId } });
  }
  return !!option;
};

/**
 * @typedef Packetoptions
 */
const Packetoptions = mongoose.model('Packetoptions', packetOptionsSchema);

module.exports = Packetoptions;

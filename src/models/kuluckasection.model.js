const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const kuluckasectionSchema = mongoose.Schema(
  {
    dictId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Kuluckadictionaries',
    },
    name: {
      type: String,
      default: '1.SET',
      required: true,
    },
    totalPages: {
      type: Number,
      default: 5,
    },
    order: {
      type: Number,
      default: 0,
    },
    pages: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isControlled: {
      type: Boolean,
      default: false,
    },
    controlAssigned: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 1 },
    },
    userAssigned: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 1 },
    },
  },
  {
    timestamps: true,
  }
);
/**
 * Check if madde is already in Db
 * @param {string} madde - The given madde's text
 * @param {ObjectId} [excludeMaddeId] - The id of the madde to be excluded
 * @returns {Promise<boolean>}
 */
kuluckasectionSchema.statics.isSectionsAlrearyInDB = async function (name, dictId, excludeMaddeId) {
  const section = await this.findOne({ name, dictId, _id: { $ne: excludeMaddeId } });
  return !!section;
};
// add plugin that converts mongoose to json
kuluckasectionSchema.plugin(toJSON);
kuluckasectionSchema.plugin(paginate);
kuluckasectionSchema.plugin(autopop);
/**
 * @typedef Kuluckasection
 */
const Kuluckasection = mongoose.model('Kuluckasection', kuluckasectionSchema);

module.exports = Kuluckasection;

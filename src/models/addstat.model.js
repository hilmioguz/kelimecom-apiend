const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const addstatSchema = mongoose.Schema(
  {
    addTerm: {
      type: String,
    },
    addType: {
      type: String,
      default: '',
    },
    secilenDil: {
      type: String,
    },
    secilenSozluk: {
      type: String,
      default: '',
    },
    secilenTip: {
      type: String,
      default: '',
    },
    addedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
addstatSchema.plugin(toJSON);
addstatSchema.plugin(paginate);

/**
 * @typedef Addstat
 */
const Addstat = mongoose.model('Addstat', addstatSchema);

module.exports = Addstat;

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const searchstatSchema = mongoose.Schema(
  {
    searchTerm: {
      type: String,
    },
    searchType: {
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
    searchedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
searchstatSchema.plugin(toJSON);
searchstatSchema.plugin(paginate);

/**
 * @typedef Searchstat
 */
const Searchstat = mongoose.model('Searchstat', searchstatSchema);

module.exports = Searchstat;

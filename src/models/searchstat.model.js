const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');

const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

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
    isInDict: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Kurumlar',
      default: null, // standard paket id in db
      autopopulate: true,
    },
    kurumId: {
      type: Schema.Types.ObjectId,
      ref: 'Kurumlar',
      default: null, // standard paket id in db
      autopopulate: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
searchstatSchema.plugin(toJSON);
searchstatSchema.plugin(paginate);
searchstatSchema.plugin(autopop);
/**
 * @typedef Searchstat
 */
const Searchstat = mongoose.model('Searchstat', searchstatSchema);

module.exports = Searchstat;

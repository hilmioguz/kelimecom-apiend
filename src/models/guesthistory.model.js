const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const guestHistorySchema = mongoose.Schema(
  {
    arananMadde: {
      type: String,
    },
    kullanılanYer: {
      type: String,
    },
    dil: {
      type: String,
    },
    sozluk: {
      type: String,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Guest',
      autopopulate: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
guestHistorySchema.plugin(toJSON);
guestHistorySchema.plugin(paginate);
guestHistorySchema.plugin(autopop);
/**
 * @typedef Guesthistory
 */
const Guesthistory = mongoose.model('Guesthistory', guestHistorySchema);

module.exports = Guesthistory;

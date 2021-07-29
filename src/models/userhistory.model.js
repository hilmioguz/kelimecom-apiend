const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const userhistorySchema = mongoose.Schema(
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
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      autopopulate: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
userhistorySchema.plugin(toJSON);
userhistorySchema.plugin(paginate);
userhistorySchema.plugin(autopop);

/**
 * @typedef Userhistory
 */
const Userhistory = mongoose.model('Userhistory', userhistorySchema);

module.exports = Userhistory;

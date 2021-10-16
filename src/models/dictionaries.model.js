const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const dictionarySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
    },
    desc: {
      type: String,
    },
    shortDesc: {
      type: String,
    },
    lang: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isBidirectional: {
      type: Boolean,
      default: false,
    },
    apa_yazar_tarih: String,
    apa_cevirmen: String,
    apa_sozluk_ismi: String,
    mla_yazar: String,
    mla_sozluk_ismi: String,
    mla_cevirmen: String,
    mla_tarih_siteadi: String,
    cms_yazar: String,
    cms_sozluk_ismi: String,
    cms_cevirmen: String,
    cms_basim_yeri: String,
    cms_tarih_siteadi: String,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
dictionarySchema.plugin(toJSON);
dictionarySchema.plugin(paginate);

/**
 * Check if dictionary is already in Db
 * @param {string} name - The given dictionary's name
 * @param {ObjectId} [excludeDictionaryId] - The id of the dictionary to be excluded
 * @returns {Promise<boolean>}
 */
dictionarySchema.statics.isDictionariesAlrearyInDB = async function (name, excludeDictionaryId) {
  const dictionary = await this.findOne({ name, _id: { $ne: excludeDictionaryId } });
  return !!dictionary;
};

/**
 * @typedef Dictionaries
 */
const Dictionaries = mongoose.model('Dictionaries', dictionarySchema);

module.exports = Dictionaries;

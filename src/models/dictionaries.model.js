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
    anlamLang: {
      type: String,
    },
    karsidil: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isUploading: {
      type: Boolean,
      default: false,
    },
    uploadPath: {
      type: String,
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
// Index for lang field for lookup performance
dictionarySchema.index({ lang: 1 });

// Index for code field for lookup performance
dictionarySchema.index({ code: 1 });

// Compound index for lang and code
dictionarySchema.index({ lang: 1, code: 1 });

// Index for isActive field
dictionarySchema.index({ isActive: 1 });

// Compound index for isActive and lang (already exists but ensuring it's there)
dictionarySchema.index({ isActive: 1, lang: 1 });

const Dictionaries = mongoose.model('Dictionaries', dictionarySchema);

module.exports = Dictionaries;

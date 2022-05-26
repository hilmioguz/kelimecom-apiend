const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const kuluckadictionarySchema = mongoose.Schema(
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
    cilt: [
      {
        start: Number,
        end: Number,
      },
    ],
    azureUrl: {
      type: String,
      default: '',
    },
    imageFilenameSytanx: {
      type: String,
      default: '',
    },
    sectionedBy: {
      type: Number,
      default: 5,
    },
    toplamSayfa: {
      type: Number,
      default: 0,
    },
    bitenSayfa: {
      type: Number,
      default: 0,
    },
    yazar: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    hakkindaBlogUrl: {
      type: String,
      default: '',
    },
    hangiAsama: {
      type: Number,
      default: 1,
      enum: [1, 2, 3],
    },
    isSectionCreated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
kuluckadictionarySchema.plugin(toJSON);
kuluckadictionarySchema.plugin(paginate);

/**
 * Check if kuluckadictionary is already in Db
 * @param {string} name - The given kuluckadictionary's name
 * @param {ObjectId} [excludeDictionaryId] - The id of the kuluckadictionary to be excluded
 * @returns {Promise<boolean>}
 */
kuluckadictionarySchema.statics.isDictionariesAlrearyInDB = async function (name, excludeDictionaryId) {
  const kuluckadictionary = await this.findOne({ name, _id: { $ne: excludeDictionaryId } });
  return !!kuluckadictionary;
};

/**
 * @typedef Dictionaries
 */
const Kuluckadictionaries = mongoose.model('Kuluckadictionaries', kuluckadictionarySchema);

module.exports = Kuluckadictionaries;

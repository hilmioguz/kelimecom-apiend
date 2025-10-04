const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { toJSON, paginate } = require('./plugins');

const siteLanguageSchema = mongoose.Schema(
  {
    value: String,
    title: {
      en: {
        type: String,
        default: '',
      },
      tr: {
        type: String,
        default: '',
      },
    },
    order: Number,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
siteLanguageSchema.plugin(AutoIncrement, { inc_field: 'order' });
// add plugin that converts mongoose to json
siteLanguageSchema.plugin(toJSON);
siteLanguageSchema.plugin(paginate);

// Indexes for performance
siteLanguageSchema.index({ isActive: 1, order: 1 });
siteLanguageSchema.index({ value: 1 });

siteLanguageSchema.statics.isSiteLanguageAlrearyInDB = async function (value, excludeLangId) {
  const lang = await this.findOne({ value, _id: { $ne: excludeLangId } });
  return !!lang;
};

/**
 * @typedef SiteLanguage
 */
const SiteLanguage = mongoose.model('Sitelanguage', siteLanguageSchema);

module.exports = SiteLanguage;

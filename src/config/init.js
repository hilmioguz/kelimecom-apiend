const { SiteLanguage } = require('../models');

module.exports = async () => {
  const langs = await SiteLanguage.find({}).lean().exec();
  if (langs.length === 0) {
    const defaultLangs = [
      {
        value: 'tr',
        title: {
          en: 'Turkish',
          tr: 'Türkçe',
        },
        order: 1,
        isActive: true,
      },
      {
        value: 'os',
        title: {
          en: 'Ottoman Tr',
          tr: 'Osmanlıca',
        },
        order: 2,
        isActive: true,
      },
      {
        value: 'ar',
        title: {
          en: 'Arabic',
          tr: 'Arapça',
        },
        order: 3,
        isActive: true,
      },
      {
        value: 'fa',
        title: {
          en: 'Persian',
          tr: 'Farsça',
        },
        order: 4,
        isActive: true,
      },
      {
        value: 'en',
        title: {
          en: 'English',
          tr: 'İngilizce',
        },
        order: 5,
        isActive: true,
      },
      {
        value: 'de',
        title: {
          en: 'German',
          tr: 'Almanca',
        },
        order: 6,
        isActive: false,
      },
      {
        value: 'fr',
        title: {
          en: 'French',
          tr: 'Fransızca',
        },
        order: 7,
        isActive: false,
      },
      {
        value: 'ru',
        title: {
          en: 'Russian',
          tr: 'Rusça',
        },
        order: 8,
        isActive: false,
      },
      {
        value: 'zh',
        title: {
          en: 'Chinese',
          tr: 'Çince',
        },
        order: 9,
        isActive: false,
      },
      {
        value: 'es',
        title: {
          en: 'Spanish',
          tr: 'İspanyolca',
        },
        order: 10,
        isActive: false,
      },
    ];
    // eslint-disable-next-line no-restricted-syntax
    for await (const lang of defaultLangs) {
      SiteLanguage.create(lang);
    }
  }
};

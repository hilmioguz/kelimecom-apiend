const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
// const slug = require('mongoose-slug-plugin');

const { toJSON, paginate, aggregatePaginate } = require('./plugins');

const { Schema } = mongoose;

const zamanliKullanici = mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);
const maddeSchema = mongoose.Schema(
  {
    madde: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    digeryazim: [
      {
        type: String,
        default: '',
      },
    ],
    whichDict: [
      {
        id: {
          type: Schema.Types.ObjectId,
          default: mongoose.Types.ObjectId(),
        },
        anlam: {
          type: String,
          required: true,
        },
        dictId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Dictionaries',
          autopopulate: true,
        },
        alttur: [
          {
            type: String,
          },
        ],
        tur: [
          {
            type: String,
            enum: ['isim', 'fiil', 'sıfat', 'zarf', 'ünlem', 'bağlaç', 'zamir', 'edat', 'mecaz', 'belirtilmemiş'],
          },
        ],
        tip: [
          {
            type: String,
            enum: [
              'deyim',
              'olay',
              'yeradı',
              'kelime',
              'atasözü',
              'kişi',
              'tamlama',
              'kalıp',
              'eser',
              'cümle',
              'belirtilmemiş',
              'yapı',
              'söz',
            ],
          },
        ],
        kokleri: [
          {
            type: String,
          },
        ],
        sesDosyasi: {
          type: String,
          default: '',
        },
        location: {
          type: [Number],
          default: [],
        },
        eserindili: {
          type: String,
          default: '',
        },
        eserindonemi: {
          type: String,
          default: '',
        },
        eserinyili: {
          type: String,
          default: '',
        },
        eserinyazari: {
          type: String,
          default: '',
        },
        esertxt: {
          type: String,
          default: '',
        },
        dili: {
          type: String,
          default: '',
        },
        kokendili: {
          type: String,
          default: '',
        },
        kokeni: {
          type: String,
          default: '',
        },
        karsi: [
          {
            dili: {
              type: String,
              default: '',
            },
            madde: {
              type: String,
              default: '',
            },
            anlam: {
              type: String,
              default: '',
            },
            sesDosyasi: {
              type: String,
              default: '',
            },
            digeryazim: [
              {
                type: String,
                default: '',
              },
            ],
          },
        ],
        sozusoyleyen: {
          type: String,
          default: '',
        },
        sekil: [
          {
            aciklama: {
              type: String,
              default: '',
            },
            url: {
              type: String,
              default: '',
            },
          },
        ],
        tarihcesi: [
          {
            baslangic: {
              type: String,
              default: '',
            },
            bitis: {
              type: String,
              default: '',
            },
            adi: {
              type: String,
              default: '',
            },
            hakimiyet: {
              type: String,
              default: '',
            },
          },
        ],
        cinsiyet: [
          {
            type: String,
          },
        ],
        bicim: [
          {
            type: String,
          },
        ],
        sinif: [
          {
            type: String,
          },
        ],
        transkripsiyon: [
          {
            type: String,
          },
        ],
        fonetik: [
          {
            type: String,
          },
        ],
        heceliyazim: [
          {
            type: String,
          },
        ],
        zitanlam: [
          {
            type: String,
          },
        ],
        esanlam: [
          {
            type: String,
          },
        ],
        telaffuz: [
          {
            type: String,
          },
        ],
        likes: [zamanliKullanici],
        favorites: [zamanliKullanici],
        bulunduguSayfalar: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

maddeSchema.index({ madde: 'text' });
// add plugin that converts mongoose to json
// maddeSchema.plugin(slug, { tmpl: '<%=madde%>' });
maddeSchema.plugin(toJSON);
maddeSchema.plugin(paginate);
maddeSchema.plugin(aggregatePaginate);
maddeSchema.plugin(autopop);

/**
 * Check if madde is already in Db
 * @param {string} madde - The given madde's text
 * @param {ObjectId} [excludeMaddeId] - The id of the madde to be excluded
 * @returns {Promise<boolean>}
 */
maddeSchema.statics.isMaddeAlrearyInDB = async function (madde, excludeMaddeId) {
  const maddem = await this.findOne({ madde, _id: { $ne: excludeMaddeId } });
  return !!maddem;
};

/**
 * @typedef Madde
 */
const Madde = mongoose.model('Madde', maddeSchema);

module.exports = Madde;

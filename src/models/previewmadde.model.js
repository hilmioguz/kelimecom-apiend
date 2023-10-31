const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
// const slug = require('mongoose-slug-plugin');

const { toJSON, paginate, aggregatePaginate } = require('./plugins');

const { Schema } = mongoose;

const previewmaddeSchema = mongoose.Schema(
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
        trim: true,
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
          trim: true,
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
            trim: true,
          },
        ],
        tur: [
          {
            type: String,
            trim: true,
            // enum: ['isim', 'fiil', 'sıfat', 'zarf', 'ünlem', 'bağlaç', 'zamir', 'edat', 'mecaz', 'belirtilmemiş'],
          },
        ],
        tip: [
          {
            type: String,
            trim: true,
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
            trim: true,
          },
        ],
        sesDosyasi: {
          type: String,
          default: '',
        },
        location: {
          type: [Number],
          trim: true,
          default: [],
        },
        eserindili: {
          type: String,
          trim: true,
          default: '',
        },
        eserindonemi: {
          type: String,
          trim: true,
          default: '',
        },
        eserinyili: {
          type: String,
          trim: true,
          default: '',
        },
        eserinyazari: {
          type: String,
          trim: true,
          default: '',
        },
        esertxt: {
          type: String,
          trim: true,
          default: '',
        },
        dili: {
          type: String,
          trim: true,
          default: '',
        },
        kokendili: {
          type: String,
          trim: true,
          default: '',
        },
        kokeni: {
          type: String,
          trim: true,
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
              trim: true,
              default: '',
            },
            sesDosyasi: {
              type: String,
              trim: true,
              default: '',
            },
            digeryazim: [
              {
                type: String,
                trim: true,
                default: '',
              },
            ],
          },
        ],
        sozusoyleyen: {
          type: String,
          trim: true,
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
            trim: true,
          },
        ],
        bicim: [
          {
            type: String,
            trim: true,
          },
        ],
        sinif: [
          {
            type: String,
            trim: true,
          },
        ],
        transkripsiyon: [
          {
            type: String,
            trim: true,
          },
        ],
        fonetik: [
          {
            type: String,
            trim: true,
          },
        ],
        heceliyazim: [
          {
            type: String,
            trim: true,
          },
        ],
        zitanlam: [
          {
            type: String,
            trim: true,
          },
        ],
        esanlam: [
          {
            type: String,
            trim: true,
          },
        ],
        telaffuz: [
          {
            type: String,
            trim: true,
          },
        ],
        likes: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        favorites: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
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

previewmaddeSchema.index({ madde: 'text' });
// add plugin that converts mongoose to json
// maddeSchema.plugin(slug, { tmpl: '<%=madde%>' });
previewmaddeSchema.plugin(toJSON);
previewmaddeSchema.plugin(paginate);
previewmaddeSchema.plugin(aggregatePaginate);
previewmaddeSchema.plugin(autopop);

/**
 * Check if madde is already in Db
 * @param {string} madde - The given madde's text
 * @param {ObjectId} [excludeMaddeId] - The id of the madde to be excluded
 * @returns {Promise<boolean>}
 */
previewmaddeSchema.statics.isMaddeAlrearyInDB = async function (madde, excludeMaddeId) {
  const maddem = await this.findOne({ madde, _id: { $ne: excludeMaddeId } });
  return !!maddem;
};

/**
 * @typedef Madde
 */
const Previewmadde = mongoose.model('Previewmadde', previewmaddeSchema);

module.exports = Previewmadde;

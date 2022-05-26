const mongoose = require('mongoose');
const autopop = require('mongoose-autopopulate');
// const slug = require('mongoose-slug-plugin');

const { toJSON, paginate, aggregatePaginate } = require('./plugins');

const { Schema } = mongoose;

const kuluckamaddeSchema = mongoose.Schema(
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
        karsiMaddeId: {
          type: Schema.Types.ObjectId,
          ref: 'Kuluckamadde',
          autopopulate: { maxDepth: 1 },
        },
        dictId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Kuluckadictionaries',
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
        userSubmitted: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          autopopulate: { maxDepth: 1 },
        },
        userConfirmed: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          autopopulate: { maxDepth: 1 },
        },
        isCheckedOutToMadde: {
          type: Boolean,
          default: false,
        },
        isDelivered: {
          type: Boolean,
          default: false,
        },
        isControlled: {
          type: Boolean,
          default: false,
        },
        isActive: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    displaydates: true,
  }
);
// kuluckamaddeSchema.options.private = false;
kuluckamaddeSchema.index({ madde: 'text' });
// add plugin that converts mongoose to json
// kuluckamaddeSchema.plugin(slug, { tmpl: '<%=madde%>' });
kuluckamaddeSchema.plugin(toJSON);
kuluckamaddeSchema.plugin(paginate);
kuluckamaddeSchema.plugin(aggregatePaginate);
kuluckamaddeSchema.plugin(autopop);

/**
 * Check if madde is already in Db
 * @param {string} madde - The given madde's text
 * @param {ObjectId} [excludeMaddeId] - The id of the madde to be excluded
 * @returns {Promise<boolean>}
 */
kuluckamaddeSchema.statics.isMaddeAlrearyInDB = async function (madde, excludeMaddeId) {
  const maddem = await this.findOne({ madde, _id: { $ne: excludeMaddeId } });
  return !!maddem;
};

/**
 * @typedef Kuluckamadde
 */
const Kuluckamadde = mongoose.model('Kuluckamadde', kuluckamaddeSchema);

module.exports = Kuluckamadde;

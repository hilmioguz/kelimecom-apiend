const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const searchstatSchema = new mongoose.Schema(
  {
    searchTerm: {
      type: String,
      required: true,
    },
    searchType: {
      type: String,
      required: true,
    },
    secilenDil: {
      type: String,
    },
    isInDict: {
      type: Boolean,
      default: false,
    },
    clientIp: {
      type: String,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    kurumId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Kurumlar',
    },
  },
  {
    timestamps: true,
  }
);

// Performans için kritik indexler
searchstatSchema.index({ 
  isInDict: 1, 
  createdAt: -1, 
  searchType: 1 
});

searchstatSchema.index({ 
  isInDict: 1, 
  secilenDil: 1, 
  createdAt: -1, 
  searchType: 1 
});

searchstatSchema.index({ 
  searchTerm: 1, 
  createdAt: -1 
});

searchstatSchema.index({ 
  createdAt: -1 
});

// userId index - kullanıcı arama geçmişi için kritik
searchstatSchema.index({ 
  userId: 1, 
  createdAt: -1 
});

// userId ve searchType kombinasyonu için index
searchstatSchema.index({ 
  userId: 1, 
  searchType: 1, 
  createdAt: -1 
});

// add plugin that converts mongoose to json
searchstatSchema.plugin(toJSON);
searchstatSchema.plugin(paginate);

const Searchstat = mongoose.model('Searchstat', searchstatSchema);

module.exports = Searchstat;
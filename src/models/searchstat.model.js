const mongoose = require('mongoose');

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

const Searchstat = mongoose.model('Searchstat', searchstatSchema);

module.exports = Searchstat;
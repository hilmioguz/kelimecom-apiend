const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const autopop = require('mongoose-autopopulate');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const { Schema } = mongoose;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      address: {
        type: String,
      },
      phone: {
        type: String,
      },
      userType: {
        type: String,
        enum: ['Bireysel', 'Kurumsal'],
        default: 'Bireysel',
      },
      logoUrl: {
        type: String,
      },
      imageUrl: {
        type: String,
      },
      contactName: {
        type: String,
      },
      ipAllowed: {
        type: String,
      },
      domainAllowed: {
        type: String,
      },
    },
    packet: {
      packetId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Packets',
        default: '60c94a46a894b90d39a55054',
        autopopulate: true,
      },
      packetBegin: {
        type: Date,
      },
      packetEnd: {
        type: Date,
      },
      creditLeft: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.plugin(autopop);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const autopop = require('mongoose-autopopulate');
const { storeIP, inRange, isV4 } = require('range_check');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const Kurumlar = require('./kurumlar.model');
const Packets = require('./packets.model');

const { ObjectId } = mongoose.Types;

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
      required() {
        return !this.googleId;
      },
      trim: true,
      minlength: 8,
      validate(value) {
        if (value && (!value.match(/\d/) || !value.match(/[a-zA-Z]/))) {
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
    canDoKulucka: {
      type: Boolean,
      default: false,
    },
    canDoKuluckaModerate: {
      type: Boolean,
      default: false,
    },
    assignedSet: {
      type: Schema.Types.ObjectId,
      ref: 'Kuluckaset',
    },
    googleId: {
      type: String,
      default: null,
    },
    picture: {
      type: String,
      default: null,
    },
    packetId: {
      type: Schema.Types.ObjectId,
      required() {
        return !this.googleId;
      },
      ref: 'Packets',
      default: ObjectId('615275545535851845375bf3'), // standard paket id in db
      autopopulate: true,
    },
    kurumId: {
      type: Schema.Types.ObjectId,
      ref: 'Kurumlar',
      default: null, // standard paket id in db
      autopopulate: true,
    },
    customPacketId: {
      type: Schema.Types.ObjectId,
      ref: 'Custompackets',
      default: null,
      autopopulate: true,
    },
    clientIp: {
      type: String,
      default: null,
    },
    paketBegin: {
      type: Date,
      default: null,
    },
    paketEnd: {
      type: Date,
      default: null,
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
 * Check if already signin
 * @param {string} googleId - The user's google id
 * @returns {Promise<boolean>}
 */
userSchema.statics.isAlreadyGoogleSigned = async function (googleId) {
  const user = await this.findOne({ googleId });
  return !!user;
};

/**
 * Get google user
 * @param {string} googleId - The user's google id
 * @returns {Promise<boolean>}
 */
userSchema.statics.getGoogleUser = async function (googleId) {
  const user = await this.findOne({ googleId });
  return user;
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
  if (this.isNew) {
    this.createAt = Date.now();
    this.updateAt = Date.now();
  } else {
    this.updateAt = Date.now();
  }
  // eslint-disable-next-line no-console
  // console.log('USER:', user);
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  if (this.isNew) {
    const userdomain = user.email.substring(user.email.lastIndexOf('@') + 1);
    try {
      const kurumlar = await Kurumlar.find({ isActive: 1 });
      const kurumsalpaket = await Packets.find({ role: 'kurumsal' });
      const standartpaket = await Packets.find({ role: 'standart' });
      const emailMatch = kurumlar.filter((kurum) => userdomain.includes(kurum.mail_suffix));
      // eslint-disable-next-line no-console
      // console.log('emailMatch:', emailMatch);
      if (emailMatch && emailMatch.length) {
        user.packetId = ObjectId(kurumsalpaket[0]._id);
        user.kurumId = ObjectId(emailMatch[0]._id);
      } else if (user.clientIp) {
        const ip = storeIP(user.clientIp);
        if (isV4(ip)) {
          const ipMatch = kurumlar.filter((kurum) => inRange(ip, kurum.cidr));
          // eslint-disable-next-line no-console
          // console.log('imatch:', ipMatch);
          if (ipMatch && ipMatch.length) {
            user.packetId = ObjectId(kurumsalpaket[0]._id);
            user.kurumId = ObjectId(ipMatch[0]._id);
          }
        }
      } else {
        user.packetId = ObjectId(standartpaket[0]._id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error:------------------------>', error);
    }
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { emailService } = require('.');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Bu e-posta adresi ile daha önce kayıt yapılmıştır. Giriş yapmayı veya şifre hatırlatmayı deneyiniz.\nKullandığınız eposta adresi bir sosyal medya hesabına ait ise (ör: gmail.com), ikona tıklayarak onun üzerinden giriş yapmayı deneyiniz.'
    );
  }
  const user = await User.create(userBody);
  return user;
};

/**
 * Create a user coming from outh goole sign
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createGoogleUser = async (profile) => {
  const payload = {
    email: profile.email,
    isEmailVerified: !!profile.email_verified,
    name: profile.name,
    picture: profile.picture,
    googleId: profile.sub,
    clientIp: profile.clientIp,
  };

  if (await User.isAlreadyGoogleSigned(payload.googleId)) {
    const user = await User.getGoogleUser(payload.googleId);

    if (!user.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Yanlış giriş ya da inaktif kullanıcı!');
    } else {
      return user;
    }
  } else {
    try {
      const user = await User.create(payload);
      // eslint-disable-next-line no-console
      console.log('GOOGLE USER CREATED:');
      emailService.sendWelcomeEmail(user.email, user.name);
      return user;
    } catch (error) {
      const user = await User.findOne({ email: payload.email });
      if (!user) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Kayıtlı Eposta kullanıcısı yok!');
      }
      user.googleId = payload.googleId;
      user.picture = payload.picture;
      user.isEmailVerified = payload.isEmailVerified;
      user.name = payload.name;
      user.clientIp = payload.clientIp;
      await user.save();
      // eslint-disable-next-line no-console
      console.log('GOOGLE USER UPDATED:');
      return user;
    }
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by google id
 * @param {string} googleId
 * @returns {Promise<User>}
 */
const getUserByGoogleId = async (googleId) => {
  return User.findOne({ googleId });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  createGoogleUser,
  queryUsers,
  getUserById,
  getUserByGoogleId,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};

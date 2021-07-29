const httpStatus = require('http-status');
const { Guest } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a guest
 * @param {Object} guestBody
 * @returns {Promise<Guest>}
 */
const createGuest = async (guestBody) => {
  if (await Guest.isGuestAlrearyInDB(guestBody.ipAddress)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Kullanılan ziyaretçi ip aynı gün içerisinde zaten tanımlı');
  }
  const guest = await Guest.create(guestBody);
  return guest;
};

/**
 * Query for guest
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryGuests = async (filter, options) => {
  const guests = await Guest.paginate(filter, options);
  return guests;
};

/**
 * Get guest by id
 * @param {ObjectId} id
 * @returns {Promise<Guest>}
 */
const getGuestById = async (id) => {
  return Guest.findById(id);
};

/**
 * Get guest by ipaddress
 * @param {string} ipAddress
 * @returns {Promise<Guest>}
 */
const getGuestByIpAddress = async (ipAddress) => {
  return Guest.findOne({ ipAddress });
};

/**
 * Update guest by id
 * @param {ObjectId} guestId
 * @param {Object} updateBody
 * @returns {Promise<Guest>}
 */
const updateGuestById = async (guestId, updateBody) => {
  const guest = await getGuestById(guestId);
  if (!guest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Belirtilen id'de ziyaretçi bulunamadı");
  }
  if (updateBody.ipAddress && (await Guest.isGuestAlrearyInDB(updateBody.ipAddress, guestId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Paket seçeneği zaten daha önce kayıtlı');
  }
  Object.assign(guest, updateBody);
  await guest.save();
  return guest;
};

/**
 * Delete guest by id
 * @param {ObjectId} guestId
 * @returns {Promise<Guest>}
 */
const deleteGuestById = async (guestId) => {
  const guest = await getGuestById(guestId);
  if (!guest) {
    throw new ApiError(httpStatus.NOT_FOUND, "Belirtilen id'de ziyaretçi bulunamadı");
  }
  await guest.remove();
  return guest;
};

module.exports = {
  createGuest,
  queryGuests,
  getGuestById,
  getGuestByIpAddress,
  updateGuestById,
  deleteGuestById,
};

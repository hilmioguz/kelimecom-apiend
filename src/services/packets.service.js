const httpStatus = require('http-status');
const { Packets } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a packet
 * @param {Object} packetBody
 * @returns {Promise<Packets>}
 */
const createPacket = async (packetBody) => {
  if (await Packets.isPacketAlrearyInDB(packetBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Packet zaten tanımlı');
  }
  const packet = await Packets.create(packetBody);
  return packet;
};

/**
 * Query for packet
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPackets = async (filter, options) => {
  const packets = await Packets.paginate(filter, options);
  return packets;
};

/**
 * Get packet by id
 * @param {ObjectId} id
 * @returns {Promise<Packets>}
 */
const getPacketById = async (id) => {
  return Packets.findById(id);
};

/**
 * Get packet by packet name
 * @param {string} name
 * @returns {Promise<Packets>}
 */
const getPacketByName = async (name) => {
  return Packets.findOne({ name });
};

/**
 * Update packet by id
 * @param {ObjectId} packetId
 * @param {Object} updateBody
 * @returns {Promise<Packets>}
 */
const updatePacketById = async (packetId, updateBody) => {
  const packet = await getPacketById(packetId);
  if (!packet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Paket bulunamadı');
  }
  if (updateBody.packet && (await Packets.isPacketAlrearyInDB(updateBody.packet, packetId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Packets zaten daha önce kayıtlı');
  }
  Object.assign(packet, updateBody);
  await packet.save();
  return packet;
};

/**
 * Delete packet by id
 * @param {ObjectId} packetId
 * @returns {Promise<Packets>}
 */
const deletePacketById = async (packetId) => {
  const packet = await getPacketById(packetId);
  if (!packet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Paket bulunamadı');
  }
  await packet.remove();
  return packet;
};

module.exports = {
  createPacket,
  queryPackets,
  getPacketById,
  getPacketByName,
  updatePacketById,
  deletePacketById,
};

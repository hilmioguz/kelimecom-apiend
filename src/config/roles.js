const allRoles = {
  guest: ['freeZone'],
  user: ['freeZone', 'authorized', 'getProfile', 'manageProfile'],
  moderater: [
    'freeZone',
    'authorized',
    'manageBlog',
    'getMadde',
    'manageMadde',
    'getDictionaries',
    'manageDictionaries',
    'manageProfile',
  ], // TODO: only manage own properties
  admin: [
    'authorized',
    'freeZone',
    'getUsers',
    'getAllStats',
    'manageUsers',
    'manageProfile',
    'manageKurumlar',
    'getMadde',
    'manageMadde',
    'manageBlog',
    'manageConfig',
    'getPacket',
    'managePacket',
    'getCustomPackets',
    'manageCustomPackets',
    'getDictionaries',
    'manageDictionaries',
    'getUserHistory',
    'manageUserHistory',
    'getGuestHistory',
    'manageGuestHistory',
  ],
};
const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

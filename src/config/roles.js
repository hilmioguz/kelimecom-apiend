const allRoles = {
  guest: ['freeZone'],
  user: ['freeZone', 'authorized', 'getProfile', 'manageProfile'],
  moderater: ['freeZone', 'authorized', 'getMadde', 'manageMadde', 'getDictionaries', 'manageDictionaries'], // TODO: only manage own properties
  admin: [
    'authorized',
    'freeZone',
    'getUsers',
    'manageUsers',
    'getMadde',
    'manageMadde',
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

const allRoles = {
  guest: ['freeZone'],
  user: ['freeZone', 'getProfile', 'manageProfile'],
  moderater: ['freeZone', 'getMadde', 'manageMadde', 'getDictionaries', 'manageDictionaries'], // TODO: only manage own properties
  admin: [
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

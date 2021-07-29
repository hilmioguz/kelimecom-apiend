const allRoles = {
  guest: ['searchMadde'],
  user: ['searchMadde', 'getProfile', 'manageProfile'],
  moderater: ['getMadde', 'manageMadde', 'getDictionaries', 'manageDictionaries'], // TODO: only manage own properties
  admin: [
    'getUsers',
    'manageUsers',
    'getMadde',
    'manageMadde',
    'getPacket',
    'managePacket',
    'getPacketOptions',
    'managePacketOptions',
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

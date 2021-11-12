const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const maddeRoute = require('./madde.route');
const gundemRoute = require('./gundem.route');
const packetRoute = require('./packet.route');
const blogRoute = require('./blog.route');
const kurumlarRoute = require('./kurumlar.route');
const kurumlarAdminRoute = require('./kurumlaradmin.route');
const customPacketRoute = require('./custompacket.route');
const dictionaryRoute = require('./dictionary.route');
const davetRoute = require('./davet.route');
const iletisimRoute = require('./iletisim.route');
const statsRoute = require('./stats.route');
const generalSearchRoute = require('./generalSearch.route');
const fileUploadRoute = require('./fileupload.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/madde',
    route: maddeRoute,
  },
  {
    path: '/packet',
    route: packetRoute,
  },
  {
    path: '/blog',
    route: blogRoute,
  },
  {
    path: '/custom-packet',
    route: customPacketRoute,
  },
  {
    path: '/dictionary',
    route: dictionaryRoute,
  },
  {
    path: '/generalsearch',
    route: generalSearchRoute,
  },
  {
    path: '/kurumlar',
    route: kurumlarRoute,
  },
  {
    path: '/davet',
    route: davetRoute,
  },
  {
    path: '/iletisim',
    route: iletisimRoute,
  },
  {
    path: '/gundem',
    route: gundemRoute,
  },
  {
    path: '/getstats',
    route: statsRoute,
  },
  {
    path: '/fileupload',
    route: fileUploadRoute,
  },
];

const adminRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/madde',
    route: maddeRoute,
  },
  {
    path: '/gundem',
    route: gundemRoute,
  },
  {
    path: '/blog',
    route: blogRoute,
  },
  {
    path: '/packet',
    route: packetRoute,
  },
  {
    path: '/dictionary',
    route: dictionaryRoute,
  },
  {
    path: '/kurumlar',
    route: kurumlarAdminRoute,
  },
  {
    path: '/getstats',
    route: statsRoute,
  },
  {
    path: '/fileupload',
    route: fileUploadRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

adminRoutes.forEach((route) => {
  router.use(`/admin${route.path}`, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

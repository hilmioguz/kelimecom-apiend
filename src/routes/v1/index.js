const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const maddeRoute = require('./madde.route');
const packetRoute = require('./packet.route');
const packetOptionRoute = require('./packetoption.route');
const dictionaryRoute = require('./dictionary.route');
const generalSearchRoute = require('./generalSearch.route');
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
    path: '/packet-option',
    route: packetOptionRoute,
  },
  {
    path: '/dictionary',
    route: dictionaryRoute,
  },
  {
    path: '/generalsearch',
    route: generalSearchRoute,
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

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

const express = require('express');
const auth = require('../../middlewares/auth');

const statsController = require('../../controllers/stats.controller');

const router = express.Router();

router.route('/').get(statsController.getStats);
router.route('/allstats').get(auth('getAllStats'), statsController.allStats);
router.route('/user-history').get(auth(), statsController.getUserSearchHistory);

module.exports = router;

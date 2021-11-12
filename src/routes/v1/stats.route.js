const express = require('express');
const auth = require('../../middlewares/auth');

const statsController = require('../../controllers/stats.controller');

const router = express.Router();

router.route('/').get(statsController.getStats);
router.route('/allstats').get(auth('getAllStats'), statsController.allStats);

module.exports = router;

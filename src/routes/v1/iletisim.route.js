const express = require('express');
const iletisimController = require('../../controllers/iletisim.controller');

const router = express.Router();

router.route('/').post(iletisimController.sendContactMessage);

module.exports = router;

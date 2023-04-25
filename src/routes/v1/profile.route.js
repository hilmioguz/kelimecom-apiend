const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const profileValidation = require('../../validations/profile.validation');
const profileController = require('../../controllers/profile.controller');

const router = express.Router();

router.route('/getLikes').post(auth('freeZone'), validate(profileValidation.getLikes), profileController.getLikes);
router
  .route('/getFavorites')
  .post(auth('freeZone'), validate(profileValidation.getFavorites), profileController.getFavorites);

module.exports = router;

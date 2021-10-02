const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invitationValidation = require('../../validations/invitation.validation');
const invitationController = require('../../controllers/invitation.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('freeZone'), validate(invitationValidation.createInvitation), invitationController.createInvitation);

module.exports = router;

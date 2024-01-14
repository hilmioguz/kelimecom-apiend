const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const maddeValidation = require('../../validations/madde.validation');
const maddeController = require('../../controllers/madde.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageMadde'), validate(maddeValidation.createMadde), maddeController.createMadde)
  .get(auth('getMadde'), validate(maddeValidation.getMaddeler), maddeController.getMaddeler);

router.route('/export/excel').get(auth('getMadde'), validate(maddeValidation.getMaddeler), maddeController.exportMaddeler);
router
  .route('/:maddeId')
  .get(auth('getMadde'), validate(maddeValidation.getMaddeById), maddeController.getMaddeById)
  .patch(auth('manageMadde'), validate(maddeValidation.updateMadde), maddeController.updateMadde)
  .delete(auth('manageMadde'), validate(maddeValidation.deleteMadde), maddeController.deleteMadde);

router
  .route('/headonly/:maddeId')
  .patch(auth('manageMadde'), validate(maddeValidation.updateHeadOnlyMadde), maddeController.updateMadde);

router
  .route('/submadde/:maddeId/:anlamId?')
  .post(auth('manageMadde'), validate(maddeValidation.createSubMadde), maddeController.createSubMadde)
  .patch(auth('manageMadde'), validate(maddeValidation.updateSubMadde), maddeController.updateSubMadde)
  .delete(auth('manageMadde'), validate(maddeValidation.deleteSubMadde), maddeController.deleteSubMadde);

router
  .route('/userfav')
  .post(auth('manageProfile'), validate(maddeValidation.userMaddeFavorites), maddeController.userMaddeFavorites);

router
  .route('/userlikes')
  .post(auth('manageProfile'), validate(maddeValidation.userMaddeLikes), maddeController.userMaddeLikes);

module.exports = router;

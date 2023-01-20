const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const previewmaddeValidation = require('../../validations/previewmadde.validation');
const previewmaddeController = require('../../controllers/previewmadde.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageMadde'), validate(previewmaddeValidation.createMadde), previewmaddeController.createMadde)
  .get(auth('getMadde'), validate(previewmaddeValidation.getMaddeler), previewmaddeController.getMaddeler);

router
  .route('/:previewmaddeId')
  .get(auth('getMadde'), validate(previewmaddeValidation.getMaddeById), previewmaddeController.getMaddeById)
  .patch(auth('manageMadde'), validate(previewmaddeValidation.updateMadde), previewmaddeController.updateMadde)
  .delete(auth('manageMadde'), validate(previewmaddeValidation.deleteMadde), previewmaddeController.deleteMadde);

router
  .route('/headonly/:previewmaddeId')
  .patch(auth('manageMadde'), validate(previewmaddeValidation.updateHeadOnlyMadde), previewmaddeController.updateMadde);

router
  .route('/subpreviewmadde/:previewmaddeId/:anlamId?')
  .post(auth('manageMadde'), validate(previewmaddeValidation.createSubMadde), previewmaddeController.createSubMadde)
  .patch(auth('manageMadde'), validate(previewmaddeValidation.updateSubMadde), previewmaddeController.updateSubMadde)
  .delete(auth('manageMadde'), validate(previewmaddeValidation.deleteSubMadde), previewmaddeController.deleteSubMadde);

router
  .route('/userfav')
  .post(
    auth('manageProfile'),
    validate(previewmaddeValidation.userMaddeFavorites),
    previewmaddeController.userMaddeFavorites
  );

router
  .route('/userlikes')
  .post(auth('manageProfile'), validate(previewmaddeValidation.userMaddeLikes), previewmaddeController.userMaddeLikes);

module.exports = router;

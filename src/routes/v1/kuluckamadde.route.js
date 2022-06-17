const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const kuluckamaddeValidation = require('../../validations/kuluckamadde.validation');
const kuluckamaddeController = require('../../controllers/kuluckamadde.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('authorized'), validate(kuluckamaddeValidation.createMadde), kuluckamaddeController.createMadde)
  .get(auth('authorized'), validate(kuluckamaddeValidation.getMaddeler), kuluckamaddeController.getMaddeler);

router.route('/getall').get(auth('freeZone'), kuluckamaddeController.getMaddeAll);
router.route('/getmyownentries:kuluckaSectionId').get(auth('authorized'), kuluckamaddeController.getMyOwnMaddeEntries);

// router.route('/getMaddeBugun').get(auth('freeZone'), kuluckamaddeController.getMaddeBugun);
// router.route('/getMaddeDun').get(auth('freeZone'), kuluckamaddeController.getMaddeDun);

router
  .route('/:maddeId')
  .get(auth('authorized'), validate(kuluckamaddeValidation.getMaddeById), kuluckamaddeController.getMaddeById)
  .patch(auth('authorized'), validate(kuluckamaddeValidation.updateMadde), kuluckamaddeController.updateMadde)
  .delete(auth('authorized'), validate(kuluckamaddeValidation.deleteMadde), kuluckamaddeController.deleteMadde);

router
  .route('/headonly/:maddeId')
  .patch(auth('manageMadde'), validate(kuluckamaddeValidation.updateHeadOnlyMadde), kuluckamaddeController.updateMadde);

router
  .route('/submadde/:maddeId/:anlamId?')
  .post(auth('manageMadde'), validate(kuluckamaddeValidation.createSubMadde), kuluckamaddeController.createSubMadde)
  .patch(auth('manageMadde'), validate(kuluckamaddeValidation.updateSubMadde), kuluckamaddeController.updateSubMadde)
  .delete(auth('manageMadde'), validate(kuluckamaddeValidation.deleteSubMadde), kuluckamaddeController.deleteSubMadde);

router
  .route('/submadde-merge/:maddeId')
  .post(auth('manageMadde'), validate(kuluckamaddeValidation.mergeSubMadde), kuluckamaddeController.mergeSubMadde);

module.exports = router;

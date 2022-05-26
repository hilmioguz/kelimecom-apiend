const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const gundemValidation = require('../../validations/gundem.validation');
const gundemController = require('../../controllers/gundem.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('freeZone'), validate(gundemValidation.createMadde), gundemController.createMadde)
  .get(auth('freeZone'), validate(gundemValidation.getMaddeler), gundemController.getMaddeler);

router.route('/getall').get(auth('freeZone'), gundemController.getMaddeAll);
router.route('/getmyownentries').get(auth('authorized'), gundemController.getMyOwnMaddeEntries);
router.route('/getMaddeBugun').get(auth('freeZone'), gundemController.getMaddeBugun);
router.route('/getMaddeDun').get(auth('freeZone'), gundemController.getMaddeDun);

router
  .route('/:maddeId')
  .get(auth('getMadde'), validate(gundemValidation.getMaddeById), gundemController.getMaddeById)
  .patch(auth('manageMadde'), validate(gundemValidation.updateMadde), gundemController.updateMadde)
  .delete(auth('manageMadde'), validate(gundemValidation.deleteMadde), gundemController.deleteMadde);

router
  .route('/headonly/:maddeId')
  .patch(auth('manageMadde'), validate(gundemValidation.updateHeadOnlyMadde), gundemController.updateMadde);

router
  .route('/submadde/:maddeId/:anlamId?')
  .post(auth('manageMadde'), validate(gundemValidation.createSubMadde), gundemController.createSubMadde)
  .patch(auth('manageMadde'), validate(gundemValidation.updateSubMadde), gundemController.updateSubMadde)
  .delete(auth('manageMadde'), validate(gundemValidation.deleteSubMadde), gundemController.deleteSubMadde);

router
  .route('/submadde-merge/:maddeId')
  .post(auth('manageMadde'), validate(gundemValidation.mergeSubMadde), gundemController.mergeSubMadde);

module.exports = router;

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const kuluckasectionValidation = require('../../validations/kuluckasections.validation');
const kuluckasectionController = require('../../controllers/kuluckasections.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageDictionaries'), validate(kuluckasectionValidation.createSection), kuluckasectionController.createSection)
  .get(auth('freeZone'), validate(kuluckasectionValidation.getSections), kuluckasectionController.getSections);

router
  .route('/:sectionId')
  .get(auth('freeZone'), validate(kuluckasectionValidation.getSectionById), kuluckasectionController.getSectionById)
  .patch(
    auth('manageDictionaries'),
    validate(kuluckasectionValidation.updateSection),
    kuluckasectionController.updateSection
  )
  .delete(
    auth('manageDictionaries'),
    validate(kuluckasectionValidation.deleteSection),
    kuluckasectionController.deleteSection
  );

router
  .route('/nextset/:sectionId')
  .get(
    auth('authorized'),
    validate(kuluckasectionValidation.getNextSectionById),
    kuluckasectionController.getNextSectionById
  );

router
  .route('/teslimet/:sectionId')
  .post(auth('authorized'), validate(kuluckasectionValidation.sectionDelivered), kuluckasectionController.sectionDelivered);
router
  .route('/kontroledildi/:sectionId/:userSubmitted')
  .post(
    auth('authorized'),
    validate(kuluckasectionValidation.sectionControlled),
    kuluckasectionController.sectionControlled
  );
router
  .route('/register/:sectionId/:userId/:isModerater')
  .post(auth('authorized'), validate(kuluckasectionValidation.sectionRegister), kuluckasectionController.sectionRegister);

module.exports = router;

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const kuluckadictionaryValidation = require('../../validations/kuluckadictionaries.validation');
const kuluckadictionaryController = require('../../controllers/kuluckadictionaries.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageDictionaries'),
    validate(kuluckadictionaryValidation.createDictionary),
    kuluckadictionaryController.createDictionary
  )
  .get(auth('freeZone'), validate(kuluckadictionaryValidation.getDictionaries), kuluckadictionaryController.getDictionaries);

router
  .route('/:dictId')
  .get(
    auth('freeZone'),
    validate(kuluckadictionaryValidation.getDictionaryById),
    kuluckadictionaryController.getDictionaryById
  )
  .patch(
    auth('manageDictionaries'),
    validate(kuluckadictionaryValidation.updateDictionary),
    kuluckadictionaryController.updateDictionary
  )
  .delete(
    auth('manageDictionaries'),
    validate(kuluckadictionaryValidation.deleteDictionary),
    kuluckadictionaryController.deleteDictionary
  );

module.exports = router;

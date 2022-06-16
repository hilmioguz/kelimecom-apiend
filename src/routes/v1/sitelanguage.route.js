const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const siteLanguageValidation = require('../../validations/sitelanguage.validation');
const siteLanguageController = require('../../controllers/sitelanguage.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageConfig'), validate(siteLanguageValidation.createSiteLanguage), siteLanguageController.createSiteLanguage)
  .get(auth('freeZone'), validate(siteLanguageValidation.getSiteLanguages), siteLanguageController.getSiteLanguages);

router
  .route('/:value')
  .get(
    auth('freeZone'),
    validate(siteLanguageValidation.getSiteLanguageByName),
    siteLanguageController.getSiteLanguageByName
  )
  .patch(
    auth('manageConfig'),
    validate(siteLanguageValidation.updateSiteLanguage),
    siteLanguageController.updateSiteLanguage
  )
  .delete(
    auth('manageConfig'),
    validate(siteLanguageValidation.deleteSiteLanguage),
    siteLanguageController.deleteSiteLanguage
  );

module.exports = router;

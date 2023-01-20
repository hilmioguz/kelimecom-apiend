const express = require('express');
const multer = require('multer');
const auth = require('../../middlewares/auth');
const excelController = require('../../controllers/excel.controller');

const excelFilter = (req, file, cb) => {
  if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
    cb(null, true);
  } else {
    cb('Please upload only excel file.', false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // eslint-disable-next-line no-undef
    cb(null, `${__basedir}/uploads/`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-kelime-${file.originalname}`);
  },
});

const uploadFile = multer({ storage, fileFilter: excelFilter });

const router = express.Router();

router.route('/upload').post(auth('manageDictionaries'), uploadFile.single('file'), excelController.upload);

module.exports = router;

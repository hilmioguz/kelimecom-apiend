const express = require('express');

const router = express.Router();
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line prefer-destructuring
const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;

const resolveBlobName = (req, file) => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    const blobName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    resolve(blobName);
  });
};

// const resolveMetadata = (req, file) => {
//     return new Promise((resolve, reject) => {
//         const metadata = yourCustomLogic(req, file);
//         resolve(metadata);
//     });
// };

// const resolveContentSettings = (req, file) => {
//     return new Promise((resolve, reject)) => {
//         const contentSettings = yourCustomLogic(req, file);
//         resolve(contentSettings);
//     };
// };

const azureStorage = new MulterAzureStorage({
  connectionString:
    'DefaultEndpointsProtocol=https;AccountName=kelimecom;AccountKey=G143UhcYyGcZ2gqT7JSKkZawkmLwyigYHkWY6BIVaFN35Gyn+UkMEeJW6bFDU9sl8QFp5Fu6S0J25eOVWq34YA==;EndpointSuffix=core.windows.net',
  //   accessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
  //   accountName: 'mystorageaccountname',
  containerName: 'public',
  blobName: resolveBlobName,
  //   metadata: resolveMetadata,
  //   contentSettings: resolveContentSettings,
  containerAccessLevel: 'blob',
  // urlExpirationTime: 60,
});

const upload = multer({
  storage: azureStorage,
});
router.route('/').post(upload.any(), (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req.files);
  if (req && req.files && req.files.length) {
    const files = req.files.map((file) => {
      const $file = file;
      // eslint-disable-next-line prefer-destructuring
      $file.url = $file.url.split('?')[0];
      // eslint-disable-next-line no-console
      return $file;
    });
    res.status(200).json(files);
  }
  res.status(400).send({ message: 'Yüklenecek Dosya yok ya da eklenmemiş.!' });
});

module.exports = router;

const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const upload = catchAsync(async (req, res) => {
  try {
    if (req.file === undefined) {
      return res.status(400).send('Excel dosyası ekleyiniz!');
    }

    if (!req.file.filename) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Dosya bulunamadı');
    }
    // eslint-disable-next-line no-undef
    const path = `${__basedir}/uploads/${req.file.filename}`;
    res.status(200).send({
      url: `${path}`,
    });
  } catch (error) {
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}`,
    });
  }

  // const dict = await dictionaryService.createDictionaries(req.body);
  // res.status(httpStatus.CREATED).send(dict);
});

module.exports = {
  upload,
};

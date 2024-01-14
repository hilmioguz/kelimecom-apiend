const httpStatus = require('http-status');
const Excel = require('exceljs');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { maddeService } = require('../services');
const { Madde } = require('../models');

const createMadde = catchAsync(async (req, res) => {
  const madde = await maddeService.createMadde(req.body);
  res.status(httpStatus.CREATED).send(madde);
});

const createSubMadde = catchAsync(async (req, res) => {
  const madde = await maddeService.createSubMadde(req.params.maddeId, req.body);
  res.status(httpStatus.CREATED).send(madde);
});

const getMaddeler = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet', 'dictId', 'dili']);
  const result = await maddeService.queryMaddeler(filter, options);
  res.send(result);
});

const exportMaddeler = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { filter } = prefilter(req, ['madde', 'tur', 'tip', 'koken', 'cinsiyet', 'dictId', 'dili']);
  const count = await Madde.countDocuments(filter);
  const downloadFilename = `Maddeler-${Date.now()}.xlsx`;
  const exceloptions = {
    filename: downloadFilename,
    useStyles: true,
    useSharedStrings: true,
    stream: res,
  };
  const workbook = new Excel.Workbook(exceloptions);
  const ws = workbook.addWorksheet('My Sheet');
  const batchLimit = 5000;
  // eslint-disable-next-line no-unused-vars
  const totalAvgCount = Math.ceil(count / batchLimit);
  ws.addRow([
    'madde',
    'digeryazim',
    'karsi',
    'anlam',
    'sozluk',
    'tip',
    'tur',
    'alttur',
    'koken',
    'cinsiyet',
    'bicim',
    'sinif',
    'transkripsiyon',
    'fonetik',
    'heceliyazim',
    'zitanlam',
    'esanlam',
    'telaffuz',
    'girisiyapan',
  ]).commit();

  let i = 0;
  // eslint-disable-next-line camelcase
  const preQuery = new Date().getTime();
  while (i < totalAvgCount) {
    // eslint-disable-next-line no-await-in-loop, camelcase
    const table_data = await Madde.find(filter)
      .sort({ _id: 1 })
      .skip(batchLimit * i)
      .limit(batchLimit)
      .allowDiskUse(true);
    // eslint-disable-next-line no-console
    // console.log('Table Data:', JSON.stringify(table_data, null, 2));
    const newa = [];
    // eslint-disable-next-line no-restricted-syntax, camelcase, no-await-in-loop
    for await (const h of table_data) {
      h.whichDict.forEach((w) => {
        const a = {};
        a.madde = h.madde;
        a.digeryazim = h.digeryazim ? h.digeryazim.join(',') : '';
        a.karsi = w.karsi && w.karsi.length ? w.karsi.map((k) => k.madde).join(',') : '';
        a.anlam = w.anlam;
        a.sozluk = w.dictId.name;
        a.tip = w.tip ? w.tip.join(',') : '';
        a.tur = w.tur ? w.tur.join(',') : '';
        a.alttur = w.alttur ? w.alttur.join(',') : '';
        a.koken = w.koken ? w.koken.join(',') : '';
        a.cinsiyet = w.cinsiyet ? w.cinsiyet.join(',') : '';
        a.bicim = w.bicim ? w.bicim.join(',') : '';
        a.sinif = w.sinif ? w.sinif.join(',') : '';
        a.transkripsiyon = w.transkripsiyon ? w.transkripsiyon.join(',') : '';
        a.fonetik = w.fonetik ? w.fonetik.join(',') : '';
        a.heceliyazim = w.heceliyazim ? w.heceliyazim.join(',') : '';
        a.zitanlam = w.zitanlam ? w.zitanlam.join(',') : '';
        a.esanlam = w.esanlam ? w.esanlam.join(',') : '';
        a.telaffuz = w.telaffuz ? w.telaffuz.join(',') : '';
        if (w.userSubmitted) a.userSubmitted = w.userSubmitted.name;
        newa.push(a);
      });
    }
    // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
    for await (const values of newa) {
      ws.addRow([
        values.madde || '',
        values.digeryazim || '',
        values.karsi || '',
        values.anlam || '',
        values.sozluk || '',
        values.tip || '',
        values.tur || '',
        values.alttur || '',
        values.koken || '',
        values.cinsiyet || '',
        values.bicim || '',
        values.sinif || '',
        values.transkripsiyon || '',
        values.fonetik || '',
        values.heceliyazim || '',
        values.zitanlam || '',
        values.esanlam || '',
        values.telaffuz || '',
        values.userSubmitted || '',
      ]).commit();
    }
    // eslint-disable-next-line no-console
    console.log('i:', i);
    i += 1;
  }
  const postQuery = new Date().getTime();
  // calculate the duration in seconds
  const duration = (postQuery - preQuery) / 1000;
  // eslint-disable-next-line no-console
  console.log('it tooks: ', duration, ' seconds');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${downloadFilename}`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
});

const getRawMaddeler = catchAsync(async (req, res) => {
  const filter = req.body.searchTerm;
  const result = await maddeService.rawQueryMaddeler(filter);
  res.send(result);
});

const getMaddeById = catchAsync(async (req, res) => {
  const madde = await maddeService.getMaddeById(req.params.maddeId);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const getMaddeByName = catchAsync(async (req, res) => {
  const madde = await maddeService.getMaddeByName(req.params.madde);
  if (!madde) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Madde bulunamadı');
  }
  res.send(madde);
});

const updateMadde = catchAsync(async (req, res) => {
  const madde = await maddeService.updateMaddeById(req.params.maddeId, req.body);
  res.send(madde);
});

const updateSubMadde = catchAsync(async (req, res) => {
  const madde = await maddeService.updateSubMaddeById(req.params.maddeId, req.body);
  res.send(madde);
});

const deleteMadde = catchAsync(async (req, res) => {
  await maddeService.deleteMaddeById(req.params.maddeId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteSubMadde = catchAsync(async (req, res) => {
  await maddeService.deleteSubMaddeById(req.params.maddeId, req.params.anlamId);
  res.status(httpStatus.NO_CONTENT).send();
});

const userMaddeFavorites = catchAsync(async (req, res) => {
  if (req.user) {
    const madde = await maddeService.userMaddeFavorites(req.body.maddeId, req.body.anlamId, req.user.id, req.body.method);
    res.send(madde);
  } else {
    throw new ApiError(httpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Not authorized. You must login first!');
  }
});

const userMaddeLikes = catchAsync(async (req, res) => {
  if (req.user) {
    const madde = await maddeService.userMaddeLikes(req.body.maddeId, req.body.anlamId, req.user.id, req.body.method);
    res.send(madde);
  } else {
    throw new ApiError(httpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Not authorized. You must login first!');
  }
});

module.exports = {
  createMadde,
  createSubMadde,
  getMaddeler,
  getRawMaddeler,
  getMaddeById,
  getMaddeByName,
  updateMadde,
  updateSubMadde,
  deleteMadde,
  deleteSubMadde,
  userMaddeFavorites,
  userMaddeLikes,
  exportMaddeler,
};

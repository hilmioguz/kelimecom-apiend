const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { kuluckasectionService } = require('../services');

const createSection = catchAsync(async (req, res) => {
  const dict = await kuluckasectionService.createSections(req.body);
  res.status(httpStatus.CREATED).send(dict);
});

const getSections = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name', 'dictId']);
  const result = await kuluckasectionService.querySections(filter, options);
  res.send(result);
});
const getNextSectionById = catchAsync(async (req, res) => {
  const sect = await kuluckasectionService.getNextSectionsById(req.params.sectionId);
  if (!sect) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  res.send(sect);
});
const getSectionById = catchAsync(async (req, res) => {
  const sect = await kuluckasectionService.getSectionsById(req.params.sectionId);
  if (!sect) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  res.send(sect);
});
const sectionRegister = catchAsync(async (req, res) => {
  const user = await kuluckasectionService.sectionRegister(req.params.sectionId, req.params.userId, req.params.isModerater);
  res.send(user);
});
const sectionDelivered = catchAsync(async (req, res) => {
  const user = await kuluckasectionService.sectionDelivered(req.params.sectionId, req.user.id);
  res.send(user);
});
const sectionControlled = catchAsync(async (req, res) => {
  const user = await kuluckasectionService.sectionControlled(req.params.sectionId, req.user.id, req.params.userSubmitted);
  res.send(user);
});
const getSectionByName = catchAsync(async (req, res) => {
  const dict = await kuluckasectionService.getSectionsByName(req.params.name);
  if (!dict) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Set bulunamadı');
  }
  res.send(dict);
});

const updateSection = catchAsync(async (req, res) => {
  const dict = await kuluckasectionService.updateSectionsById(req.params.sectionId, req.body);
  res.send(dict);
});

const deleteSection = catchAsync(async (req, res) => {
  await kuluckasectionService.deleteSectionsById(req.params.sectionId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteKuluckaci = catchAsync(async (req, res) => {
  await kuluckasectionService.deleteKuluckaci(req.params.sectionId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteDenetimci = catchAsync(async (req, res) => {
  await kuluckasectionService.deleteDenetimci(req.params.sectionId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSection,
  getSections,
  getSectionById,
  getSectionByName,
  updateSection,
  deleteSection,
  sectionRegister,
  sectionControlled,
  sectionDelivered,
  getNextSectionById,
  deleteDenetimci,
  deleteKuluckaci,
};

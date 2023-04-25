const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { profileService } = require('../services');
const pick = require('../utils/pick');

const createProfile = catchAsync(async (req, res) => {
  const profile = await profileService.createProfile(req.body);
  res.status(httpStatus.CREATED).send(profile);
});

const getProfiles = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name', 'isActive']);
  const result = await profileService.queryProfiles(filter, options);
  res.send(result);
});

const getProfileById = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileById(req.params.slug);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile bulunamadı');
  }
  res.send(profile);
});

const getProfileByName = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileByName(req.params.slug);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile bulunamadı');
  }
  res.send(profile);
});

const updateProfile = catchAsync(async (req, res) => {
  const profile = await profileService.updateProfileById(req.params.slug, req.body);
  res.send(profile);
});

const deleteProfile = catchAsync(async (req, res) => {
  await profileService.deleteProfileById(req.params.slug);
  res.status(httpStatus.NO_CONTENT).send();
});

const getLikes = catchAsync(async (req, res) => {
  const { user } = req;

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kullanıcı bulunamadı');
  }

  const options = pick(req.body, ['sortBy', 'limit', 'page']);
  const result = await profileService.getLikes(user.id, options);
  res.send(result);
});

const getFavorites = catchAsync(async (req, res) => {
  const { user } = req;

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Kullanıcı bulunamadı');
  }

  const options = pick(req.body, ['sortBy', 'limit', 'page']);
  const result = await profileService.getFavorites(user.id, options);
  res.send(result);
});

module.exports = {
  createProfile,
  getProfiles,
  getProfileById,
  getProfileByName,
  updateProfile,
  deleteProfile,
  getLikes,
  getFavorites,
};

const Joi = require('joi');
// const { objectId } = require('./custom.validation');

const createProfile = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    slug: Joi.string().required(),
    image: Joi.string().optional(),
    innerImage: Joi.string().optional(),
    body: Joi.string().required(),
    author: Joi.string().optional(),
    isActive: Joi.boolean(),
  }),
};

const getProfiles = {
  query: Joi.object().keys({
    title: Joi.string().optional(),
    slug: Joi.string().optional(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProfileByName = {
  params: Joi.object().keys({
    slug: Joi.string(),
  }),
};

const getProfileById = {
  params: Joi.object().keys({
    slug: Joi.string(),
  }),
};

const updateProfile = {
  params: Joi.object().keys({
    slug: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().required(),
      slug: Joi.string().required(),
      image: Joi.string().optional(),
      innerImage: Joi.string().optional(),
      body: Joi.string().required(),
      author: Joi.string().optional(),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteProfile = {
  params: Joi.object().keys({
    slug: Joi.string(),
  }),
};

const getLikes = {
  body: Joi.object().keys({
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

const getFavorites = {
  body: Joi.object().keys({
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional(),
  }),
};

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

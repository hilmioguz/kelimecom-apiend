const Joi = require('joi');
// const { objectId } = require('./custom.validation');

const createBlog = {
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

const getBlogs = {
  query: Joi.object().keys({
    title: Joi.string().optional(),
    slug: Joi.string().optional(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBlogByName = {
  params: Joi.object().keys({
    slug: Joi.string(),
  }),
};

const getBlogById = {
  params: Joi.object().keys({
    slug: Joi.string(),
  }),
};

const updateBlog = {
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

const deleteBlog = {
  params: Joi.object().keys({
    slug: Joi.string(),
  }),
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  getBlogByName,
  updateBlog,
  deleteBlog,
};

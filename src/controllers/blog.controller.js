const httpStatus = require('http-status');
const prefilter = require('../utils/prefilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { blogService } = require('../services');

const createBlog = catchAsync(async (req, res) => {
  const blog = await blogService.createBlog(req.body);
  res.status(httpStatus.CREATED).send(blog);
});

const getBlogs = catchAsync(async (req, res) => {
  const { filter, options } = prefilter(req, ['name', 'isActive']);
  const result = await blogService.queryBlogs(filter, options);
  res.send(result);
});

const getBlogById = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.slug);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog bulunamadı');
  }
  res.send(blog);
});

const getBlogByName = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogByName(req.params.slug);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Blog bulunamadı');
  }
  res.send(blog);
});

const updateBlog = catchAsync(async (req, res) => {
  const blog = await blogService.updateBlogById(req.params.slug, req.body);
  res.send(blog);
});

const deleteBlog = catchAsync(async (req, res) => {
  await blogService.deleteBlogById(req.params.slug);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  getBlogByName,
  updateBlog,
  deleteBlog,
};

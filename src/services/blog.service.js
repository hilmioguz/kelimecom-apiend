const httpStatus = require('http-status');
const { Blog } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a blog
 * @param {Object} blogBody
 * @returns {Promise<Blog>}
 */
const createBlog = async (blogBody) => {
  if (await Blog.isBlogAlrearyInDB(blogBody.slug)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Blog zaten tanımlı');
  }
  const blog = await Blog.create(blogBody);
  return blog;
};

/**
 * Query for blog
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBlogs = async (filter, options) => {
  const blogs = await Blog.paginate(filter, options);
  return blogs;
};

/**
 * Get blog by id
 * @param {ObjectId} id
 * @returns {Promise<Blog>}
 */
const getBlogById = async (slug) => {
  return Blog.findOne({ slug });
};

/**
 * Get blog by blog name
 * @param {string} name
 * @returns {Promise<Blog>}
 */
const getBlogByName = async (slug) => {
  return Blog.findOne({ slug });
};

/**
 * Update blog by id
 * @param {String} slug
 * @param {Object} updateBody
 * @returns {Promise<Blog>}
 */
const updateBlogById = async (slug, updateBody) => {
  const blog = await getBlogById(slug);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'blog bulunamadı');
  }
  if (updateBody.blog && (await Blog.isBlogAlrearyInDB(updateBody.blog, slug))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Blog zaten daha önce kayıtlı');
  }
  Object.assign(blog, updateBody);
  await blog.save();
  return blog;
};

/**
 * Delete blog by id
 * @param {String} slug
 * @returns {Promise<Blog>}
 */
const deleteBlogById = async (slug) => {
  const blog = await getBlogById(slug);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'blog bulunamadı');
  }
  await blog.remove();
  return blog;
};

module.exports = {
  createBlog,
  queryBlogs,
  getBlogById,
  getBlogByName,
  updateBlogById,
  deleteBlogById,
};

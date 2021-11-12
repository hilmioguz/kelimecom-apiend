const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const blogValidation = require('../../validations/blog.validation');
const blogController = require('../../controllers/blog.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageBlog'), validate(blogValidation.createBlog), blogController.createBlog)
  .get(auth('freeZone'), validate(blogValidation.getBlogs), blogController.getBlogs);

router
  .route('/:slug')
  .get(auth('freeZone'), validate(blogValidation.getBlogByName), blogController.getBlogByName)
  .patch(auth('manageBlog'), validate(blogValidation.updateBlog), blogController.updateBlog)
  .delete(auth('manageBlog'), validate(blogValidation.deleteBlog), blogController.deleteBlog);

module.exports = router;

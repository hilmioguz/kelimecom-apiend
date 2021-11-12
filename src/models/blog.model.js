const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const blogSchema = Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: String,
    body: String,
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    author: {
      type: String,
      default: 'Kelime.com',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
    displaydates: true,
  }
);

// add plugin that converts mongoose to json
blogSchema.plugin(toJSON);
blogSchema.plugin(paginate);

/**
 * Check if blog is already in Db
 * @param {string} name - The given blog's slug
 * @param {ObjectId} [excludeBlogId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */

blogSchema.statics.isBlogAlrearyInDB = async function (slug, excludeBlogId) {
  const blog = await this.findOne({ slug, _id: { $ne: excludeBlogId } });
  return !!blog;
};

/**
 * @typedef Blog
 */
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const blogSchema = Schema(
  {
    title: String,
    image: String,
    body: String,
    slug: String,
    author: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      username: { type: String, default: 'Kelime.com' },
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
  }
);

// add plugin that converts mongoose to json
blogSchema.plugin(toJSON);
blogSchema.plugin(paginate);

/**
 * @typedef Blog
 */
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

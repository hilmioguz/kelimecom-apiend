const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const commentSchema = mongoose.Schema(
  {
    body: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
commentSchema.plugin(toJSON);
commentSchema.plugin(paginate);

/**
 * @typedef Comment
 */
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

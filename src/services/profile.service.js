const mongoose = require('mongoose');
const { Madde } = require('../models');

// eslint-disable-next-line no-unused-vars
const { ObjectId } = mongoose.Types;

const getFavorites = async (userId, options) => {
  const aggArray = [
    {
      $match: {
        'whichDict.favorites.userId': {
          $in: [new ObjectId(userId)],
        },
      },
    },
    {
      $unwind: {
        path: '$whichDict',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'whichDict.favorites.userId': {
          $in: [new ObjectId(userId)],
        },
      },
    },
    {
      $sort: {
        'whichDict.favorites.createdAt': -1,
      },
    },
    {
      $lookup: {
        from: 'dictionaries',
        localField: 'whichDict.dictId',
        foreignField: '_id',
        as: 'dict',
      },
    },
    {
      $unwind: {
        path: '$dict',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  const suboptions = {
    limit: options.limit,
    page: options.page || 1,
  };
  const agg = Madde.aggregate(aggArray).allowDiskUse(true);
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      // console.log('ERROR_____>:', err);
      return err;
    }
    return results;
  });
  return maddeler;
};

const getLikes = async (userId, options) => {
  const aggArray = [
    {
      $match: {
        'whichDict.likes.userId': {
          $in: [new ObjectId(userId)],
        },
      },
    },
    {
      $unwind: {
        path: '$whichDict',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'whichDict.likes.userId': {
          $in: [new ObjectId(userId)],
        },
      },
    },
    {
      $sort: {
        'whichDict.likes.createdAt': -1,
      },
    },
    {
      $lookup: {
        from: 'dictionaries',
        localField: 'whichDict.dictId',
        foreignField: '_id',
        as: 'dict',
      },
    },
    {
      $unwind: {
        path: '$dict',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  const agg = Madde.aggregate(aggArray).allowDiskUse(true);

  const suboptions = {
    limit: options.limit,
    page: options.page || 1,
  };
  const maddeler = await Madde.aggregatePaginate(agg, suboptions, (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      // console.log('ERROR_____>:', err);
      return err;
    }
    return results;
  });
  return maddeler;
};

module.exports = {
  getFavorites,
  getLikes,
};

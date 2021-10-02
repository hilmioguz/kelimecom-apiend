/* eslint-disable no-param-reassign */

const aggregatePaginate = (schema) => {
  /**
   * Paginate Mongoose aggregate result
   * @param  {Aggregate} aggregate
   * @param  {any} options {page: number/string default 10, limit: number/string default 10,sort: any default null}
   * @param  {function} [callback]
   * @returns {Promise}
   */

  schema.statics.aggregatePaginate = async function (aggregate, options, callback) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    const pageNumber = parseInt(options.page || 1, 10);
    const resultsPerPage = parseInt(options.limit || 10, 10);
    const skipDocuments = (pageNumber - 1) * resultsPerPage;
    const { sort } = options;

    const q = this.aggregate(aggregate._pipeline);
    const countQuery = this.aggregate(q._pipeline);
    if (Object.prototype.hasOwnProperty.call(q, 'options')) {
      q.options = aggregate.options;
      countQuery.options = aggregate.options;
    }

    if (sort) {
      q.sort(sort);
    }
    // eslint-disable-next-line no-console
    // console.log('Q:', JSON.stringify(q));
    return Promise.all([
      q.skip(skipDocuments).limit(resultsPerPage).exec(),
      countQuery
        .group({
          _id: null,
          count: { $sum: 1 },
        })
        .exec(),
    ])
      .then(function (values) {
        const count = values[1][0] ? values[1][0].count : 0;

        const result = {
          data: values[0],
          meta: {
            page: pageNumber,
            pages: Math.ceil(count / resultsPerPage) || 1,
            perpage: resultsPerPage,
            total: count,
          },
        };

        if (typeof callback === 'function') {
          return callback(null, result);
        }

        return Promise.resolve(result);
      })
      .catch(function (reject) {
        if (typeof callback === 'function') {
          return callback(reject);
        }
        return Promise.reject(reject);
      });
  };
};

module.exports = aggregatePaginate;

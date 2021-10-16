const pick = require('./pick');

/**
 * Create an prefiltered formatted object composed of the picked object properties
 * @param {Object} req
 * @param {string[]} allowedfields
 * @returns {Object}
 */
const prefilter = (req, allowedfields) => {
  const q = req.query ? req.query : req;
  // eslint-disable-next-line no-console
  // const qoption = {
  //   sortBy: q.sort ? `${q.sort.field}:${q.sort.sort}` : '',
  //   limit: q.pagination ? q.pagination.perpage : null,
  //   page: q.pagination ? q.pagination.page : null,
  // };
  let sortby = null;
  if (q.sortBy && q.sortBy[0] && q.sortDesc && q.sortDesc[0]) {
    const direct = q.sortDesc[0] === 'false' ? 'asc' : 'desc';
    sortby = `${q.sortBy[0]}:${direct}`;
  }

  const qoption = {
    sortBy: sortby || '',
    // eslint-disable-next-line no-nested-ternary
    limit: q.perpage ? q.perpage : q.itemsPerPage ? Number(q.itemsPerPage) : 10,
    page: q.page ? Number(q.page) : 1,
  };

  // eslint-disable-next-line no-console
  const options = pick(qoption, ['sortBy', 'sortDesc', 'limit', 'page']);
  const picked = pick(q, ['searchTerm', 'searchField', 'searchType']);
  let filter = null;
  if (picked) {
    if (picked.searchType === 'simple') {
      filter = { $text: { $search: picked.searchTerm } };
      options.type = 'textSearch';
    } else if (picked.searchTerm && picked.searchField) {
      const keyim = picked.searchField;
      filter = {
        [keyim]: {
          $regex: picked.searchTerm,
          $options: 'i',
        },
      };
    } else if (picked.searchTerm && allowedfields) {
      filter = {
        $or: allowedfields.map((obj) => ({
          [obj]: { $regex: picked.searchTerm, $options: 'i' },
        })),
      };
    }
  }
  // eslint-disable-next-line no-console
  // console.log('filter:', filter, 'options:', options);
  return { filter, options };
};

module.exports = prefilter;

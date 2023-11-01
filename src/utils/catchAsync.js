const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === 'function') {
      next(err);
    } else {
      // eslint-disable-next-line no-console
      console.log('Error:', err);
    }
  });
};

module.exports = catchAsync;

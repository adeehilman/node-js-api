module.exports = function throwError(message, status = 500, details = null) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  throw err;
};


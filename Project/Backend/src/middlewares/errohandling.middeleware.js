const sendError = require('../utils/apiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  if (res.headersSent) return next(err);

  if (statusCode === 400 && err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'INVALID_JSON', 'Die Anfrage enthält ungültiges JSON.');
  }
  if (statusCode >= 500) {
    return sendError(
      res,
      500,
      'INTERNAL_ERROR',
      'Ein interner Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    );
  }
  return sendError(
    res,
    statusCode,
    err.code,
    err.publicMessage || err.message || 'Die Anfrage konnte nicht verarbeitet werden.',
  );
};

module.exports = errorHandler;

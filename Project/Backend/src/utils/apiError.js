const DEFAULT_CODES = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'RATE_LIMITED',
  501: 'NOT_IMPLEMENTED',
  500: 'INTERNAL_ERROR',
};

function sendError(res, status, code, message, details) {
  const error = {
    code: code || DEFAULT_CODES[status] || 'INTERNAL_ERROR',
    message,
  };
  if (details) error.details = details;
  return res.status(status).json({ error });
}

module.exports = sendError;

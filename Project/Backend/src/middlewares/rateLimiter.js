// Rate Limiter
const loginLimiter = (req, res, next) => next();
const requestLimiter = (req, res, next) => next();

module.exports = {
  loginLimiter,
  requestLimiter,
};

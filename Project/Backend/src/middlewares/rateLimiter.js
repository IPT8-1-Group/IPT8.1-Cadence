// Einfaches In-Memory Rate-Limiting gegen Brute-Force-Angriffe
const sendError = require('../utils/apiError');

function createRateLimiter(maxRequests = 10, windowMs = 60 * 1000) {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requests.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requests.set(ip, record);

    if (record.count > maxRequests) {
      return sendError(
        res,
        429,
        'RATE_LIMITED',
        'Zu viele Anmeldeversuche. Bitte warten Sie eine Minute und versuchen Sie es erneut.',
      );
    }

    next();
  };
}

module.exports = {
  loginLimiter: createRateLimiter(10, 60 * 1000),
  requestLimiter: createRateLimiter(10, 60 * 1000),
};

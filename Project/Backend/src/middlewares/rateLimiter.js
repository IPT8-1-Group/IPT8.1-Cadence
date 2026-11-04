// Einfaches In-Memory Rate-Limiting gegen Brute-Force-Angriffe

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
      return res.status(429).json({
        error: 'Zu viele Anfragen. Bitte warte eine Minute.',
      });
    }

    next();
  };
}

module.exports = {
  loginLimiter: createRateLimiter(10, 60 * 1000),
  requestLimiter: createRateLimiter(10, 60 * 1000),
};

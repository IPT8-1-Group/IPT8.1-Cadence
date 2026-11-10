const logger = require("../utils/logger");

function logModuleRequest(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    const route = req.route ? `${req.baseUrl}${req.route.path}` : req.baseUrl;

    logger.log(level, "Module API request completed", {
      method: req.method,
      route,
      status,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}

module.exports = logModuleRequest;

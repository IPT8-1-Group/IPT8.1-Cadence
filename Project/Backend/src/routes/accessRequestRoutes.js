const express = require('express');
const router = express.Router();
const accessRequestController = require('../controllers/accessRequestController');
const { requestLimiter } = require('../middlewares/rateLimiter');

// Oeffentliche Zugangsanfrage stellen mit Rate-Limit
router.post('/', requestLimiter, accessRequestController.submitRequest);

module.exports = router;


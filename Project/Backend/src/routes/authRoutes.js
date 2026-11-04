const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

// Oeffentliche Endpunkte
router.post('/login', loginLimiter, authController.login);
router.post('/verify', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/set-password', authController.setPassword);

// Geschuetzte Endpunkte
router.get('/me', requireAuth, authController.getMe);
router.post('/change-password', requireAuth, authController.changePassword);

// Registrierung ist ausschliesslich Admins vorbehalten
router.post('/register', requireAuth, requireAdmin, authController.register);

module.exports = router;

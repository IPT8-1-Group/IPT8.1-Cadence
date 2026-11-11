const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accessRequestController = require('../controllers/accessRequestController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// Alle Admin-Routen erfordern Anmeldung und Admin-Rolle
router.use(requireAuth, requireAdmin);

// Benutzerverwaltung
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id', adminController.updateUser);

// Zugangsanfragen verwalten
router.get('/access-requests', accessRequestController.listRequests);
router.post('/access-requests/:id/approve', accessRequestController.approveRequest);
router.post('/access-requests/:id/reject', accessRequestController.rejectRequest);

module.exports = router;


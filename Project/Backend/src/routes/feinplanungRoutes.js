const express = require('express');
const router = express.Router();
const feinplanungController = require('../controllers/feinplanungController');

// Drag & Drop (muss vor /:id definiert werden)
router.put('/reorder', feinplanungController.reorderFeinplanung);
router.post('/reorder', feinplanungController.reorderFeinplanung);
router.post('/:id/move', feinplanungController.moveFeinplanung);
router.put('/:id/move', feinplanungController.moveFeinplanung);

// Standard CRUD
router.get('/', feinplanungController.getFeinplanungen);
router.get('/:id', feinplanungController.getFeinplanung);
router.post('/', feinplanungController.createFeinplanung);
router.put('/:id', feinplanungController.updateFeinplanung);
router.delete('/:id', feinplanungController.deleteFeinplanung);

module.exports = router;

const express = require('express');
const router = express.Router();
const feinplanungController = require('../controllers/feinplanungController');

router.get('/', feinplanungController.getFeinplanungen);
router.get('/:id', feinplanungController.getFeinplanung);
router.post('/', feinplanungController.createFeinplanung);
router.put('/:id', feinplanungController.updateFeinplanung);
router.delete('/:id', feinplanungController.deleteFeinplanung);
router.post('/:id/move', feinplanungController.moveFeinplanung);
router.put('/:id/move', feinplanungController.moveFeinplanung);

module.exports = router;


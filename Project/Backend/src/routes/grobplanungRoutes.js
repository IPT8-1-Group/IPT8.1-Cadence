const express = require('express');
const router = express.Router();
const grobplanungController = require('../controllers/grobplanungController');

router.get('/', grobplanungController.getOutlines);
router.get('/:id', grobplanungController.getOutline);
router.post('/', grobplanungController.createOutline);
router.put('/:id', grobplanungController.updateOutline);
router.delete('/:id', grobplanungController.deleteOutline);
router.post('/:id/move', grobplanungController.moveOutline);

module.exports = router;

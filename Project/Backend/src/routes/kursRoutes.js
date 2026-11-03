const express = require('express');
const router = express.Router();
const kursController = require('../controllers/kursController');

router.get('/', kursController.getCourses);
router.get('/:id', kursController.getCourse);
router.post('/', kursController.createCourse);
router.put('/:id', kursController.updateCourse);
router.delete('/:id', kursController.deleteCourse);

module.exports = router;

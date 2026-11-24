const express = require('express');
const router = express.Router();
const kursController = require('../controllers/kursController');

// Kurse
router.get('/', kursController.getCourses);
router.get('/:id', kursController.getCourse);
router.post('/', kursController.createCourse);
router.put('/:id', kursController.updateCourse);
router.delete('/:id', kursController.deleteCourse);

// Kurstage
router.get('/:courseId/days', kursController.getCourseDays);
router.post('/:courseId/days', kursController.addCourseDay);
router.get('/days/:dayId', kursController.getCourseDay);
router.put('/days/:dayId', kursController.updateCourseDay);
router.delete('/days/:dayId', kursController.deleteCourseDay);
router.put('/:courseId/days/:dayId', kursController.updateCourseDay);
router.delete('/:courseId/days/:dayId', kursController.deleteCourseDay);

module.exports = router;

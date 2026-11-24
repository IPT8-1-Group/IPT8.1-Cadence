const kursModel = require('../models/kursModel');
const sendError = require('../utils/apiError');

async function getCourses(req, res) {
  try {
    const courses = await kursModel.getAllCourses();
    res.json(courses);
  } catch {
    sendError(res, 500, 'COURSES_LOAD_FAILED', 'Die Kurse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
  }
}

async function getCourse(req, res) {
  try {
    const course = await kursModel.getCourseById(req.params.id);
    if (!course) {
      return sendError(res, 404, 'COURSE_NOT_FOUND', 'Der Kurs wurde nicht gefunden.');
    }
    res.json(course);
  } catch {
    sendError(res, 500, 'COURSE_LOAD_FAILED', 'Der Kurs konnte nicht geladen werden. ');
  }
}

async function createCourse(req, res) {
  const { title, desc, fk_module_id, moduleId } = req.body;
  const modId = fk_module_id || moduleId;

  if (!title || !modId) {
    return sendError(res, 400, 'REQUIRED_FIELDS_MISSING', 'Titel und Modul sind erforderlich.');
  }

  try {
    const id = await kursModel.createCourse(title, desc || null, modId);
    res.status(201).json({ id, title, desc: desc || null, fk_module_id: modId });
  } catch {
    sendError(res, 500, 'COURSE_CREATE_FAILED', 'Der Kurs konnte nicht erstellt werden.');
  }
}

async function updateCourse(req, res) {
  const { title, desc } = req.body;
  try {
    const updated = await kursModel.updateCourse(req.params.id, title, desc);
    if (!updated) {
      return sendError(res, 404, 'COURSE_NOT_FOUND', 'Der Kurs wurde nicht gefunden.');
    }
    res.json(updated);
  } catch {
    sendError(res, 500, 'COURSE_UPDATE_FAILED', 'Der Kurs konnte nicht aktualisiert werden.');
  }
}

async function deleteCourse(req, res) {
  try {
    await kursModel.deleteCourse(req.params.id);
    res.status(204).send();
  } catch {
    sendError(res, 500, 'COURSE_DELETE_FAILED', 'Der Kurs konnte nicht gelöcht werden. Bite versuchen Sie es später erneut.');
  }
}

// Kurstage (Course_day)
async function getCourseDays(req, res) {
  const courseId = req.params.courseId || req.params.id;
  try {
    const days = await kursModel.getDaysByCourseId(courseId);
    res.json(days);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Kurstage' });
  }
}

async function getCourseDay(req, res) {
  const dayId = req.params.dayId || req.params.id;
  try {
    const day = await kursModel.getDayById(dayId);
    if (!day) {
      return res.status(404).json({ error: 'Kurstag nicht gefunden' });
    }
    res.json(day);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Kurstags' });
  }
}

async function addCourseDay(req, res) {
  const courseId = req.params.courseId || req.params.id;
  const { date, startTime, start_time, endTime, end_time } = req.body;

  try {
    const course = await kursModel.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Kurs nicht gefunden' });
    }

    const day = await kursModel.createDay(
      courseId,
      date,
      startTime || start_time || '08:15:00',
      endTime || end_time || '16:45:00'
    );
    res.status(201).json(day);
  } catch {
    res.status(500).json({ error: 'Fehler beim Anlegen des Kurstags' });
  }
}

async function updateCourseDay(req, res) {
  const dayId = req.params.dayId || req.params.id;
  try {
    const updated = await kursModel.updateDay(dayId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Kurstag nicht gefunden' });
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Kurstags' });
  }
}

async function deleteCourseDay(req, res) {
  const dayId = req.params.dayId || req.params.id;
  try {
    await kursModel.deleteDay(dayId);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Kurstags' });
  }
}

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseDays,
  getCourseDay,
  addCourseDay,
  updateCourseDay,
  deleteCourseDay,
};

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

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};

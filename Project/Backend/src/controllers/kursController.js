const kursModel = require('../models/kursModel');

async function getCourses(req, res) {
  try {
    const courses = await kursModel.getAllCourses();
    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Kurse' });
  }
}

async function getCourse(req, res) {
  try {
    const course = await kursModel.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Kurs nicht gefunden' });
    }
    res.json(course);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Kurses' });
  }
}

async function createCourse(req, res) {
  const { title, desc, fk_module_id, moduleId } = req.body;
  const modId = fk_module_id || moduleId;

  if (!title || !modId) {
    return res.status(400).json({ error: 'title und fk_module_id sind erforderlich' });
  }

  try {
    const id = await kursModel.createCourse(title, desc || null, modId);
    res.status(201).json({ id, title, desc: desc || null, fk_module_id: modId });
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Kurses' });
  }
}

async function updateCourse(req, res) {
  const { title, desc } = req.body;
  try {
    const updated = await kursModel.updateCourse(req.params.id, title, desc);
    if (!updated) {
      return res.status(404).json({ error: 'Kurs nicht gefunden' });
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Kurses' });
  }
}

async function deleteCourse(req, res) {
  try {
    await kursModel.deleteCourse(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Fehler beim Loeschen des Kurses' });
  }
}

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};

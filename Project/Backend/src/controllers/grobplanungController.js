const grobplanungModel = require('../models/grobplanungModel');

async function getOutlines(req, res) {
  try {
    const outlines = await grobplanungModel.getAllOutlines(req.query.courseId);
    res.json(outlines);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Grobplanung' });
  }
}

async function getOutline(req, res) {
  try {
    const item = await grobplanungModel.getOutlineById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Eintrags' });
  }
}

async function createOutline(req, res) {
  const { title, desc, fk_course, courseId } = req.body;
  const cId = fk_course || courseId;

  if (!title || !cId) {
    return res.status(400).json({ error: 'title und fk_course sind erforderlich' });
  }

  try {
    const id = await grobplanungModel.createOutline(title, desc || null, cId);
    res.status(201).json({ id, title, desc: desc || null, fk_course: cId });
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Eintrags' });
  }
}

async function updateOutline(req, res) {
  const { title, desc } = req.body;
  try {
    const updated = await grobplanungModel.updateOutline(req.params.id, title, desc);
    if (!updated) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
}

async function deleteOutline(req, res) {
  try {
    await grobplanungModel.deleteOutline(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Fehler beim Loeschen' });
  }
}

async function moveOutline(req, res) {
  const { targetCourseId, fk_course, courseId } = req.body;
  const newCourseId = targetCourseId || fk_course || courseId;

  if (!newCourseId) {
    return res.status(400).json({ error: 'targetCourseId ist erforderlich' });
  }

  try {
    const updated = await grobplanungModel.moveOutline(req.params.id, newCourseId);
    if (!updated) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Verschieben' });
  }
}

module.exports = {
  getOutlines,
  getOutline,
  createOutline,
  updateOutline,
  deleteOutline,
  moveOutline,
};

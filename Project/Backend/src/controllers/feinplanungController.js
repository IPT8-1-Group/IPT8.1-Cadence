const feinplanungModel = require('../models/feinplanungModel');

async function getFeinplanungen(req, res) {
  try {
    const dayId = req.query.dayId || req.query.fk_course_day;
    const entries = await feinplanungModel.getAllFeinplanungen(dayId);
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Feinplanung' });
  }
}

async function getFeinplanung(req, res) {
  try {
    const entry = await feinplanungModel.getFeinplanungById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    res.json(entry);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Eintrags' });
  }
}

async function createFeinplanung(req, res) {
  const { topic, desc, dur_min, fk_course_day, dayId, fk_outline_planning, outlineId } = req.body;
  const targetDay = fk_course_day || dayId;
  const targetOutline = fk_outline_planning !== undefined ? fk_outline_planning : outlineId;

  if (!topic || !targetDay) {
    return res.status(400).json({ error: 'topic und fk_course_day sind erforderlich' });
  }

  try {
    const id = await feinplanungModel.createFeinplanung(
      topic,
      desc || null,
      dur_min || 45,
      targetDay,
      targetOutline || null
    );
    res.status(201).json({
      id,
      topic,
      desc: desc || null,
      dur_min: dur_min || 45,
      fk_course_day: targetDay,
      fk_outline_planning: targetOutline || null,
    });
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Eintrags' });
  }
}

async function updateFeinplanung(req, res) {
  const { topic, desc, dur_min, fk_course_day, dayId, fk_outline_planning, outlineId } = req.body;
  try {
    const current = await feinplanungModel.getFeinplanungById(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }

    const updated = await feinplanungModel.updateFeinplanung(
      req.params.id,
      topic !== undefined ? topic : current.topic,
      desc !== undefined ? desc : current.desc,
      dur_min !== undefined ? dur_min : current.dur_min,
      (fk_course_day || dayId) || current.fk_course_day,
      fk_outline_planning !== undefined ? fk_outline_planning : (outlineId !== undefined ? outlineId : current.fk_outline_planning)
    );

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
}

async function deleteFeinplanung(req, res) {
  try {
    await feinplanungModel.deleteFeinplanung(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Fehler beim Loeschen' });
  }
}

async function moveFeinplanung(req, res) {
  const { targetDayId, fk_course_day, dayId, targetOutlineId, fk_outline_planning, outlineId } = req.body;
  const newDayId = targetDayId || fk_course_day || dayId;
  const newOutlineId = targetOutlineId !== undefined ? targetOutlineId : (fk_outline_planning !== undefined ? fk_outline_planning : outlineId);

  if (!newDayId) {
    return res.status(400).json({ error: 'targetDayId ist erforderlich' });
  }

  try {
    const updated = await feinplanungModel.moveFeinplanung(req.params.id, newDayId, newOutlineId);
    if (!updated) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Fehler beim Verschieben' });
  }
}

module.exports = {
  getFeinplanungen,
  getFeinplanung,
  createFeinplanung,
  updateFeinplanung,
  deleteFeinplanung,
  moveFeinplanung,
};


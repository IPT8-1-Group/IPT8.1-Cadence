const feinplanungModel = require('../models/feinplanungModel');

async function getFeinplanungen(req, res) {
  try {
    const dayId = req.query.dayId || req.query.fk_course_day;
    const result = await feinplanungModel.getAllFeinplanungen(dayId);
    if (dayId && !result) {
      return res.status(404).json({ error: 'Kurstag nicht gefunden' });
    }
    res.json(result);
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
  const { topic, desc, dur_min, duration, fk_course_day, dayId, fk_outline_planning, outlineId } = req.body;
  const targetDay = fk_course_day || dayId;
  const targetOutline = fk_outline_planning !== undefined ? fk_outline_planning : outlineId;
  const minutes = Number(dur_min || duration || 45);

  if (!topic || !targetDay) {
    return res.status(400).json({ error: 'topic und fk_course_day sind erforderlich' });
  }
  if (isNaN(minutes) || minutes <= 0) {
    return res.status(400).json({ error: 'dur_min muss eine positive Zahl sein' });
  }

  try {
    const created = await feinplanungModel.createFeinplanung(
      topic,
      desc || null,
      minutes,
      targetDay,
      targetOutline || null
    );
    if (created.error === 'DAY_NOT_FOUND') {
      return res.status(404).json({ error: 'Kurstag nicht gefunden' });
    }
    const newEntry = await feinplanungModel.getFeinplanungById(created.id);
    res.status(201).json(newEntry);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Eintrags' });
  }
}

async function updateFeinplanung(req, res) {
  const { topic, desc, dur_min, duration, fk_course_day, dayId, fk_outline_planning, outlineId } = req.body;
  try {
    const current = await feinplanungModel.getFeinplanungById(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }

    const minutes = dur_min !== undefined || duration !== undefined ? Number(dur_min || duration) : current.dur_min;
    if (isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ error: 'dur_min muss eine positive Zahl sein' });
    }

    const updated = await feinplanungModel.updateFeinplanung(
      req.params.id,
      topic !== undefined ? topic : current.topic,
      desc !== undefined ? desc : current.desc,
      minutes,
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
    const moved = await feinplanungModel.moveFeinplanung(req.params.id, newDayId, newOutlineId);
    if (!moved) {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    if (moved.error === 'DAY_NOT_FOUND') {
      return res.status(404).json({ error: 'Ziel-Kurstag nicht gefunden' });
    }
    res.json(moved);
  } catch {
    res.status(500).json({ error: 'Fehler beim Verschieben' });
  }
}

async function reorderFeinplanung(req, res) {
  const { dayId, fk_course_day, orderedIds } = req.body;
  const targetDay = dayId || fk_course_day;

  if (!targetDay || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'dayId und orderedIds (Array) sind erforderlich' });
  }

  try {
    const result = await feinplanungModel.reorderFeinplanung(targetDay, orderedIds);
    if (result && result.error === 'DAY_NOT_FOUND') {
      return res.status(404).json({ error: 'Kurstag nicht gefunden' });
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Umsortieren' });
  }
}

module.exports = {
  getFeinplanungen,
  getFeinplanung,
  createFeinplanung,
  updateFeinplanung,
  deleteFeinplanung,
  moveFeinplanung,
  reorderFeinplanung,
};

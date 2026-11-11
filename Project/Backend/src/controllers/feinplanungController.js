const feinplanungModel = require('../models/feinplanungModel');
const sendError = require('../utils/apiError');

async function getFeinplanungen(req, res) {
  try {
    const dayId = req.query.dayId || req.query.fk_course_day;
    const result = await feinplanungModel.getAllFeinplanungen(dayId);
    if (dayId && !result) {
      return sendError(res, 404, 'COURSE_DAY_NOT_FOUND', 'Der Kurstag wurde nicht gefunden.');
    }
    res.json(result);
  } catch {
    sendError(res, 500, 'LESSON_PLAN_LOAD_FAILED', 'Die Feinplanung konnte nicht geladen werden. ');
  }
}

async function getFeinplanung(req, res) {
  try {
    const entry = await feinplanungModel.getFeinplanungById(req.params.id);
    if (!entry) {
      return sendError(res, 404, 'LESSON_NOT_FOUND', 'Der Feinplanungseintrag wurde nicht gefunden.');
    }
    res.json(entry);
  } catch {
    sendError(res, 500, 'LESSON_LOAD_FAILED', 'Der Feinplanungseintrag konnte nicht geladen werden. ');
  }
}

async function createFeinplanung(req, res) {
  const { topic, desc, dur_min, duration, fk_course_day, dayId, fk_outline_planning, outlineId } = req.body;
  const targetDay = fk_course_day || dayId;
  const targetOutline = fk_outline_planning !== undefined ? fk_outline_planning : outlineId;
  const minutes = Number(dur_min || duration || 45);

  if (!topic || !targetDay) {
    return sendError(res, 400, 'REQUIRED_FIELDS_MISSING', 'Thema und Kurstag sind erforderlich.');
  }
  if (isNaN(minutes) || minutes <= 0) {
    return sendError(res, 400, 'INVALID_DURATION', 'Die Dauer muss eine positive Zahl in Minuten sein.');
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
      return sendError(res, 404, 'COURSE_DAY_NOT_FOUND', 'Der Kurstag wurde nicht gefunden.');
    }
    const newEntry = await feinplanungModel.getFeinplanungById(created.id);
    res.status(201).json(newEntry);
  } catch {
    sendError(res, 500, 'LESSON_CREATE_FAILED', 'Der Feinplanungseintrag konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
  }
}

async function updateFeinplanung(req, res) {
  const { topic, desc, dur_min, duration, fk_course_day, dayId, fk_outline_planning, outlineId } = req.body;
  try {
    const current = await feinplanungModel.getFeinplanungById(req.params.id);
    if (!current) {
      return sendError(res, 404, 'LESSON_NOT_FOUND', 'Der Feinplanungseintrag wurde nicht gefunden.');
    }

    const minutes = dur_min !== undefined || duration !== undefined ? Number(dur_min || duration) : current.dur_min;
    if (isNaN(minutes) || minutes <= 0) {
      return sendError(res, 400, 'INVALID_DURATION', 'Die Dauer muss eine positive Zahl in Minuten sein.');
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
    sendError(res, 500, 'LESSON_UPDATE_FAILED', 'Der Feinplanungseintrag konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut.');
  }
}

async function deleteFeinplanung(req, res) {
  try {
    await feinplanungModel.deleteFeinplanung(req.params.id);
    res.status(204).send();
  } catch {
    sendError(res, 500, 'LESSON_DELETE_FAILED', 'Der Feinplanungseintrag konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.');
  }
}

async function moveFeinplanung(req, res) {
  const { targetDayId, fk_course_day, dayId, targetOutlineId, fk_outline_planning, outlineId } = req.body;
  const newDayId = targetDayId || fk_course_day || dayId;
  const newOutlineId = targetOutlineId !== undefined ? targetOutlineId : (fk_outline_planning !== undefined ? fk_outline_planning : outlineId);

  if (!newDayId) {
    return sendError(res, 400, 'TARGET_DAY_REQUIRED', 'Bitte wählen Sie einen Zielkurstag aus.');
  }

  try {
    const moved = await feinplanungModel.moveFeinplanung(req.params.id, newDayId, newOutlineId);
    if (!moved) {
      return sendError(res, 404, 'LESSON_NOT_FOUND', 'Der Feinplanungseintrag wurde nicht gefunden.');
    }
    if (moved.error === 'DAY_NOT_FOUND') {
      return sendError(res, 404, 'TARGET_DAY_NOT_FOUND', 'Der ausgewählte Zielkurstag wurde nicht gefunden.');
    }
    res.json(moved);
  } catch {
    sendError(res, 500, 'LESSON_MOVE_FAILED', 'Der Feinplanungseintrag konnte nicht verschoben werden. Bitte versuchen Sie es später erneut.');
  }
}

async function reorderFeinplanung(req, res) {
  const { dayId, fk_course_day, orderedIds } = req.body;
  const targetDay = dayId || fk_course_day;

  if (!targetDay || !Array.isArray(orderedIds)) {
    return sendError(res, 400, 'REORDER_FIELDS_REQUIRED', 'Bitte geben Sie einen Kurstag und eine Liste der Einträge an.');
  }

  try {
    const result = await feinplanungModel.reorderFeinplanung(targetDay, orderedIds);
    if (result && result.error === 'DAY_NOT_FOUND') {
      return sendError(res, 404, 'COURSE_DAY_NOT_FOUND', 'Der Kurstag wurde nicht gefunden.');
    }
    res.json(result);
  } catch {
    sendError(res, 500, 'LESSON_REORDER_FAILED', 'Die Feinplanung konnte nicht umsortiert werden. Bitte versuchen Sie es später erneut.');
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

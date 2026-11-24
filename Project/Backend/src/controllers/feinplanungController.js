const feinplanungModel = require('../models/feinplanungModel');
const sendError = require('../utils/apiError');

async function getFeinplanungen(req, res) {
  try {
    const dayId = req.query.dayId || req.query.fk_course_day;
    if (dayId !== undefined && !validId(dayId)) return sendError(res, 400, 'INVALID_DAY', 'Ungültiger Kurstag.');
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

// Only named lesson fields are passed to the model. Omitted fields on PUT
// keep their previous values, including the optional outline association.
function validId(value) {
  return (typeof value === 'number' || typeof value === 'string') &&
    Number.isSafeInteger(Number(value)) && Number(value) > 0;
}

function readFields(body) {
  const fields = {};
  const limits = { topic: 100, desc: 255, method: 100, medium: 100, comment: 255 };
  for (const [key, limit] of Object.entries(limits)) {
    if (body[key] === undefined) continue;
    if (body[key] === null && key !== 'topic') fields[key] = null;
    else if (typeof body[key] === 'string' && body[key].length <= limit) fields[key] = body[key].trim();
    else return null;
  }
  if (fields.topic === '') return null;
  const minutes = body.dur_min ?? body.duration;
  if (minutes !== undefined) {
    fields.dur_min = Number(minutes);
    if (!Number.isSafeInteger(fields.dur_min) || fields.dur_min < 1 || fields.dur_min > 2147483647) return null;
  }
  if (body.fk_course_day !== undefined || body.dayId !== undefined) {
    fields.fk_course_day = Number(body.fk_course_day ?? body.dayId);
    if (!Number.isSafeInteger(fields.fk_course_day) || fields.fk_course_day < 1) return null;
  }
  const outline = body.fk_outline_planning !== undefined ? body.fk_outline_planning : body.outlineId;
  if (outline !== undefined) {
    if (outline !== null && !validId(outline)) return null;
    fields.fk_outline_planning = outline === null ? null : Number(outline);
  }
  return fields;
}

function sendPlan(res, result, status = 200) {
  if (!result) return sendError(res, 404, 'LESSON_NOT_FOUND', 'Der Eintrag wurde nicht gefunden.');
  if (result.error === 'DAY_NOT_FOUND') return sendError(res, 404, 'COURSE_DAY_NOT_FOUND', 'Der Kurstag wurde nicht gefunden.');
  if (result.error === 'PLAN_CHANGED') return sendError(res, 409, 'PLAN_CHANGED', 'Die Planung hat sich geändert. Bitte laden Sie den aktuellen Stand.');
  return res.status(status).json(result);
}

async function createFeinplanung(req, res) {
  const fields = readFields(req.body ?? {});
  if (!fields?.topic || !fields.fk_course_day) {
    return sendError(res, 400, 'INVALID_ENTRY', 'Bitte prüfen Sie Inhalt, Kurstag, Dauer und Textlängen.');
  }
  try {
    sendPlan(res, await feinplanungModel.createFeinplanung(fields), 201);
  } catch {
    sendError(res, 500, 'LESSON_CREATE_FAILED', 'Der Eintrag konnte nicht erstellt werden.');
  }
}

async function updateFeinplanung(req, res) {
  const fields = readFields(req.body ?? {});
  if (!fields) return sendError(res, 400, 'INVALID_ENTRY', 'Bitte prüfen Sie Inhalt, Dauer und Textlängen.');
  try {
    sendPlan(res, await feinplanungModel.updateFeinplanung(req.params.id, fields));
  } catch {
    sendError(res, 500, 'LESSON_UPDATE_FAILED', 'Der Eintrag konnte nicht aktualisiert werden.');
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

  if (!validId(newDayId) || (newOutlineId != null && !validId(newOutlineId))) {
    return sendError(res, 400, 'TARGET_DAY_REQUIRED', 'Bitte wählen Sie einen Zielkurstag aus.');
  }

  try {
    const moved = await feinplanungModel.moveFeinplanung(req.params.id, newDayId, newOutlineId);
    sendPlan(res, moved);
  } catch {
    sendError(res, 500, 'LESSON_MOVE_FAILED', 'Der Feinplanungseintrag konnte nicht verschoben werden. Bitte versuchen Sie es später erneut.');
  }
}

async function reorderFeinplanung(req, res) {
  const { dayId, fk_course_day, orderedIds } = req.body;
  const targetDay = dayId || fk_course_day;

  if (!validId(targetDay) || !Array.isArray(orderedIds) || !orderedIds.every(Number.isSafeInteger)) {
    return sendError(res, 400, 'REORDER_FIELDS_REQUIRED', 'Bitte geben Sie einen Kurstag und eine Liste der Einträge an.');
  }

  try {
    const result = await feinplanungModel.reorderFeinplanung(targetDay, orderedIds);
    sendPlan(res, result);
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

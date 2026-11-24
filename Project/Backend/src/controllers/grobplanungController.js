const grobplanungModel = require('../models/grobplanungModel');
const sendError = require('../utils/apiError');

async function getOutlines(req, res) {
  try {
    const outlines = await grobplanungModel.getAllOutlines(req.query.courseId);
    res.json(outlines);
  } catch {
    sendError(res, 500, 'OUTLINES_LOAD_FAILED', 'Die Grobplanung konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
  }
}

async function getPlacements(req, res) {
  const courseId = Number(req.params.courseId);
  if (!Number.isSafeInteger(courseId) || courseId <= 0) {
    return sendError(res, 400, 'INVALID_COURSE_ID', 'Die Kurs-ID ist ungültig.');
  }
  try {
    res.json(await grobplanungModel.getPlacements(courseId));
  } catch {
    sendError(res, 500, 'PLACEMENTS_LOAD_FAILED', 'Die Themenzuordnung konnte nicht geladen werden.');
  }
}

async function placeOutline(req, res) {
  const courseId = Number(req.params.courseId);
  const { outlineId, fromDayId, targetDayId, orderedIds = [] } = req.body ?? {};
  const validId = id => Number.isSafeInteger(id) && id > 0;
  if (!validId(courseId) || !validId(outlineId) ||
      (fromDayId !== null && !validId(fromDayId)) ||
      (targetDayId !== null && !validId(targetDayId)) ||
      !Array.isArray(orderedIds) || !orderedIds.every(validId) ||
      new Set(orderedIds).size !== orderedIds.length) {
    return sendError(res, 400, 'INVALID_PLACEMENT', 'Prüfe Thema, Kurstage und Reihenfolge.');
  }
  try {
    const result = await grobplanungModel.placeOutline(courseId, {
      outlineId, fromDayId, targetDayId, orderedIds,
    });
    if (result === 'not_found') {
      return sendError(res, 404, 'PLACEMENT_NOT_FOUND', 'Kurs, Thema oder Kurstag wurde nicht gefunden.');
    }
    if (result === 'changed') {
      return sendError(res, 409, 'PLACEMENT_CHANGED', 'Die Zuordnung wurde verändert. Bitte lade die Planung neu.');
    }
    if (result === 'linked') {
      return sendError(res, 409, 'PLACEMENT_LINKED', 'Das Thema ist mit einer Feinplanung verknüpft und kann nicht vom Kurstag entfernt werden.');
    }
    if (result !== 'saved') throw new Error('Unexpected placement result');
    res.json({ status: 'saved' });
  } catch {
    sendError(res, 500, 'PLACEMENT_SAVE_FAILED', 'Die Themenzuordnung konnte nicht gespeichert werden.');
  }
}

async function getOutline(req, res) {
  try {
    const item = await grobplanungModel.getOutlineById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'OUTLINE_NOT_FOUND', 'Der Grobplanungseintrag wurde nicht gefunden.');
    }
    res.json(item);
  } catch {
    sendError(res, 500, 'OUTLINE_LOAD_FAILED', 'Der Grobplanungseintrag konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
  }
}

async function createOutline(req, res) {
  const { title, desc, fk_course, courseId, dayId = null } = req.body ?? {};
  const cId = Number(fk_course || courseId);

  if (!title || !cId) {
    return sendError(res, 400, 'REQUIRED_FIELDS_MISSING', 'Titel und Kurs sind erforderlich.');
  }

  try {
    const id = await grobplanungModel.createOutline(title.trim(), desc || null, cId, dayId);
    if (!id) return sendError(res, 404, 'COURSE_OR_DAY_NOT_FOUND', 'Kurs oder Kurstag nicht gefunden.');
    res.status(201).json({ id, title: title.trim(), desc: desc || null, fk_course: cId });
  } catch {
    sendError(res, 500, 'OUTLINE_CREATE_FAILED', 'Der Grobplanungseintrag konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
  }
}

async function updateOutline(req, res) {
  const { title, desc } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 100 ||
      (desc != null && (typeof desc !== 'string' || desc.length > 255))) {
    return sendError(res, 400, 'INVALID_OUTLINE', 'Prüfe Titel und Beschreibung.');
  }
  try {
    const updated = await grobplanungModel.updateOutline(req.params.id, title.trim(), desc ?? null);
    if (!updated) {
      return sendError(res, 404, 'OUTLINE_NOT_FOUND', 'Der Grobplanungseintrag wurde nicht gefunden.');
    }
    res.json(updated);
  } catch {
    sendError(res, 500, 'OUTLINE_UPDATE_FAILED', 'Der Grobplanungseintrag konnte nicht aktuallisiert werden. Bitte versuchen Sie es später erneut.');
  }
}

async function deleteOutline(req, res) {
  try {
    await grobplanungModel.deleteOutline(req.params.id);
    res.status(204).send();
  } catch {
    sendError(res, 500, 'OUTLINE_DELETE_FAILED', 'Der Grobplanungseintrag konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.');
  }
}

async function moveOutline(req, res) {
  const { targetCourseId, fk_course, courseId } = req.body;
  const newCourseId = targetCourseId || fk_course || courseId;

  if (!newCourseId) {
    return sendError(res, 400, 'TARGET_COURSE_REQUIRED', 'Bitte wählen Sie einen Zielkurs aus.');
  }

  try {
    const updated = await grobplanungModel.moveOutline(req.params.id, newCourseId);
    if (!updated) {
      return sendError(res, 404, 'OUTLINE_NOT_FOUND', 'Der Grobplanungseintrag wurde nicht gefunden.');
    }
    res.json(updated);
  } catch {
    sendError(res, 500, 'OUTLINE_MOVE_FAILED', 'Der Grobplanungseintrag konnte nicht verschoben werden. ');
  }
}

module.exports = {
  getOutlines,
  getPlacements,
  placeOutline,
  getOutline,
  createOutline,
  updateOutline,
  deleteOutline,
  moveOutline,
};

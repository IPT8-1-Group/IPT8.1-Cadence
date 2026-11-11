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
  const { title, desc, fk_course, courseId } = req.body;
  const cId = fk_course || courseId;

  if (!title || !cId) {
    return sendError(res, 400, 'REQUIRED_FIELDS_MISSING', 'Titel und Kurs sind erforderlich.');
  }

  try {
    const id = await grobplanungModel.createOutline(title, desc || null, cId);
    res.status(201).json({ id, title, desc: desc || null, fk_course: cId });
  } catch {
    sendError(res, 500, 'OUTLINE_CREATE_FAILED', 'Der Grobplanungseintrag konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
  }
}

async function updateOutline(req, res) {
  const { title, desc } = req.body;
  try {
    const updated = await grobplanungModel.updateOutline(req.params.id, title, desc);
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
  getOutline,
  createOutline,
  updateOutline,
  deleteOutline,
  moveOutline,
};

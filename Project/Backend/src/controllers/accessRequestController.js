const authModel = require('../models/authModel');
const authService = require('../services/authService');
const { isValidEmail } = require('../utils/validators');
const sendError = require('../utils/apiError');

async function submitRequest(req, res) {
  const body = req.body || {};
  const { firstName, lastName, email,institution, additionalInformation } = body;
  const jobTitleValue = body.jobTitle || body.job_title|| body.funktion|| body.function||'';
  const jobTitle = typeof jobTitleValue === 'string' ? jobTitleValue.trim() : '';

  if ([firstName, lastName, email, institution, jobTitle].some((value) => typeof value !== 'string' || !value.trim())) {
    return sendError(res, 400, 'REQUIRED_FIELDS_MISSING', 'Bitte fülen Sie Vorname, Nachname, E-Mail, institution und Funktion/Berufsbezeichnung aus.');
  }

  if (!isValidEmail(email)) {
    return sendError(res, 400, 'INVALID_EMAIL', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
  }

  const existingUser = await authModel.findUserByEmail(email);
  if (existingUser) {
    return sendError(res, 409, 'EMAIL_ALREADY_REGISTERED', 'Für diese E-Mail-Adresse besteht bereits ein Benutzerkonto.');
  }

  const existingRequest = await authModel.findPendingAccessRequestByEmail(email);
  if (existingRequest) {
    return sendError(res, 409, 'REQUEST_ALREADY_PENDING', 'Für diese E-Mail-Adresse liegt bereits eine offene Zugangsanfrage vor.');
  }

  try {
    const id = await authModel.createAccessRequest({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      institution: institution.trim(),
      jobTitle,
      additionalInfo: typeof additionalInformation === 'string' ? additionalInformation.trim() : '',
    });

    res.status(201).json({ message: 'Zugangsanfrage erfolgreich eingereicht', id });
  } catch {
    sendError(res, 500, 'ACCESS_REQUEST_CREATE_FAILED', 'Die Zugangsanfrage konnte nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
  }
}

async function listRequests(req, res) {
  try {
    const requests = await authModel.getAllAccessRequests();
    res.json(requests);
  } catch {
    sendError(res, 500, 'ACCESS_REQUESTS_LOAD_FAILED', 'Die Zugangsanfragen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
  }
}

async function approveRequest(req, res) {
  const { id } = req.params;
  const request = await authModel.getAccessRequestById(id);

  if (!request) {
    return sendError(res, 404, 'ACCESS_REQUEST_NOT_FOUND', 'Die Zugangsanfrage wurde nicht gefunden.');
  }

  if (request.status !== 'pending') {
    return sendError(res, 409, 'ACCESS_REQUEST_ALREADY_PROCESSED', 'Die Zugangsanfrage wurde bereits bearbeitet.');
  }

  // Pruefen ob der Benutzer schon existiert
  let user = await authModel.findUserByEmail(request.email);
  if (user) {
    await authModel.updateAccessRequestStatus(id, 'approved');
    return sendError(res, 409, 'EMAIL_ALREADY_REGISTERED', 'Für diese E-Mail-Adresse besteht bereits ein Benutzerkonto.');
  }

  // Benutzer anlegen mit temporaerem Passwort (muss ueber Link gesetzt werden)
  const tempPassword = Math.random().toString(36).slice(-10);
  const userId = await authService.registerUser({
    email: request.email,
    password: tempPassword,
    role: 'user',
    firstName: request.first_name,
    lastName: request.last_name,
    institution: request.institution,
    jobTitle: request.job_title || request.jobTitle || request.function || '',
  });

  // Einmaligen zeitlich begrenzten Token zum Passwort-Setzen erstellen
  const resetToken = await authService.createPasswordResetToken(userId);
  await authModel.updateAccessRequestStatus(id, 'approved');

  res.json({
    message: 'Zugangsanfrage genehmigt und Benutzer erstellt',
    setPasswordToken: resetToken,
    setPasswordLink: `/set-password?token=${resetToken}`,
  });
}

async function rejectRequest(req, res) {
  const { id } = req.params;
  const request = await authModel.getAccessRequestById(id);

  if (!request) {
    return sendError(res, 404, 'ACCESS_REQUEST_NOT_FOUND', 'Die Zugangsanfrage wurde nicht gefunden.');
  }

  if (request.status !== 'pending') {
    return sendError(res, 409, 'ACCESS_REQUEST_ALREADY_PROCESSED', 'Die Zugangsanfrage wurde bereits bearbeitet.');
  }

  await authModel.updateAccessRequestStatus(id, 'rejected');
  res.json({ message: 'Zugangsanfrage abgelehnt' });
}

module.exports = {
  submitRequest,
  listRequests,
  approveRequest,
  rejectRequest,
};

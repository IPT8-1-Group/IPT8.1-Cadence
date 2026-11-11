const authModel = require('../models/authModel');
const authService = require('../services/authService');
const { isValidEmail } = require('../utils/validators');

async function submitRequest(req, res) {
  const { firstName, lastName, email, institution, additionalInformation } = req.body;
  const jobTitle = (req.body.jobTitle || req.body.job_title || req.body.funktion || req.body.function || '').trim();

  if (!firstName || !lastName || !email || !institution || !jobTitle) {
    return res.status(400).json({ error: 'Vorname, Nachname, E-Mail, Institution und Funktion/Berufsbezeichnung sind erforderlich' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Gültige E-Mail-Adresse erforderlich' });
  }

  const existingUser = await authModel.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Für diese E-Mail existiert bereits ein Benutzerkonto' });
  }

  const existingRequest = await authModel.findPendingAccessRequestByEmail(email);
  if (existingRequest) {
    return res.status(400).json({ error: 'Für diese E-Mail existiert bereits eine offene Anfrage' });
  }

  try {
    const id = await authModel.createAccessRequest({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      institution: institution.trim(),
      jobTitle,
      additionalInfo: additionalInformation ? additionalInformation.trim() : '',
    });

    res.status(201).json({ message: 'Zugangsanfrage erfolgreich eingereicht', id });
  } catch {
    res.status(500).json({ error: 'Fehler beim Speichern der Zugangsanfrage' });
  }
}

async function listRequests(req, res) {
  try {
    const requests = await authModel.getAllAccessRequests();
    res.json(requests);
  } catch {
    res.status(500).json({ error: 'Fehler beim Abrufen der Zugangsanfragen' });
  }
}

async function approveRequest(req, res) {
  const { id } = req.params;
  const request = await authModel.getAccessRequestById(id);

  if (!request) {
    return res.status(404).json({ error: 'Anfrage nicht gefunden' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Anfrage wurde bereits bearbeitet' });
  }

  // Pruefen ob der Benutzer schon existiert
  let user = await authModel.findUserByEmail(request.email);
  if (user) {
    await authModel.updateAccessRequestStatus(id, 'approved');
    return res.status(400).json({ error: 'Benutzerkonto existiert bereits' });
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
    return res.status(404).json({ error: 'Anfrage nicht gefunden' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Anfrage wurde bereits bearbeitet' });
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

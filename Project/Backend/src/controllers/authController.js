const authService = require('../services/authService');
const authModel = require('../models/authModel');
const { isValidEmail, isValidPassword } = require('../utils/validators');
const sendError = require('../utils/apiError');

async function register(req, res) {
  const body = req.body || {};
  const { email, password, role, firstName, lastName, institution } = body;
  const jobTitle = body.jobTitle || body.job_title || body.funktion || body.function || '';

  if (!email || !isValidEmail(email)) {
    return sendError(res, 400, 'INVALID_EMAIL', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
  }

  if (!password || !isValidPassword(password)) {
    return sendError(
      res,
      400,
      'INVALID_PASSWORD',
      'Das Passwort muss mindestens 8 Zeichen lang sein und Buchstaben und auch Zahlen enthalten.',
    );
  }

  const existing = await authModel.findUserByEmail(email);
  if (existing) {
    return sendError(res, 409, 'EMAIL_ALREADY_REGISTERED', 'Diese E-Mail Adresse wird schon verwendet.');
  }

  const id = await authService.registerUser({
    email,
    password,
    role: role || 'user',
    firstName: firstName || '',
    lastName: lastName || '',
    institution: institution || '',
    jobTitle,
  });
  res.status(201).json({ message: 'Benutzer erfolgreich erstellt', id });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'E-Mail Adresse oder Passwort ist falsch.');
  }

  const result = await authService.loginUser(email, password);
  if (!result) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'E-Mail Adresse oder Passwort ist falsch.');
  }

  res.json({
    message: 'Anmeldung erfolgreich',
    token: result.token,
    private_key: result.privateKey,
    user: result.user,
  });
}

async function getMe(req, res) {
  // req.user wird von requireAuth gesetzt
  res.json({ user: req.user });
}

async function setPassword(req, res) {
  const { token, password } = req.body || {};

  if (!token) {
    return sendError(res, 400, 'TOKEN_REQUIRED', 'Der Link zum Festlegen des Passworts ist unvollständig.');
  }

  if (!password || !isValidPassword(password)) {
    return sendError(
      res,
      400,
      'INVALID_PASSWORD',
      'Das Passwort muss midestein 8 Zeichen lang sein und Buchstaben sowie Zahlen enthalten.',
    );
  }

  const success = await authService.setPasswordWithToken(token, password);
  if (!success) {
    return sendError(res, 400, 'RESET_LINK_INVALID', 'Der Link ist ungültig oder abgelaufen. Fordere einen neuen Link an.');
  }

  res.json({ message: 'Passwort erfolgreich gesetzt' });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body || {};

  if (!oldPassword || !newPassword) {
    return sendError(res, 400, 'PASSWORDS_REQUIRED', 'Bitte geben Sie Ihr aktuelles und Ihr neues Passwort ein.');
  }

  if (!isValidPassword(newPassword)) {
    return sendError(
      res,
      400,
      'INVALID_PASSWORD',
      'Das neue Passwort muss mindestens 8 Zeichen lang sein und Buchstaben sowie Zahlen enthalten.',
    );
  }
// ich bin mir nicht sicher ob ich das noch umendern muss
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  if (!result.success) {
    const invalidPassword = result.error === 'Altes Passwort stimmt nicht';
    return sendError(
      res,
      invalidPassword ? 401 : 404,
      invalidPassword ? 'INVALID_CURRENT_PASSWORD' : 'USER_NOT_FOUND',
      invalidPassword ? 'Das aktuelle Passwort ist falsch.' : 'Das Benutzerkonto wurde nicht gefunden.',
    );
  }

  res.json({ message: 'Passwort erfolgreich geändert' });
}

async function verify(req, res) {
  const { email, private_key } = req.body || {};
  const token = await authService.verifyToken(email, private_key);
  if (!token) {
    return sendError(res, 401, 'TOKEN_INVALID', 'Die Sitzung ist ungültig oder abgelaufen. bitte melden Sie sich erneut an.');
  }
  res.json({ message: 'Valid' });
}

async function refresh(req, res) {
  const { email, private_key } = req.body || {};
  const refreshed = await authService.refreshToken(email, private_key);
  if (!refreshed) {
    return sendError(res, 401, 'TOKEN_INVALID', 'Die Sitzung ist ungültig oder abgelaufen. Bitte melden Sie sich erneut an.');
  }
  res.json({ message: 'Refreshed' });
}

async function logout(req, res) {
  const { email, private_key } = req.body || {};
  const loggedOut = await authService.logoutUser(email, private_key);
  if (!loggedOut) {
    return sendError(res, 401, 'TOKEN_INVALID', 'Die Sitzung ist ungültig oder bereits beendet.');
  }
  res.json({ message: 'Logged out' });
}

module.exports = {
  register,
  login,
  getMe,
  setPassword,
  changePassword,
  verify,
  refresh,
  logout,
};

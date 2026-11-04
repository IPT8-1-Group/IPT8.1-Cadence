const authService = require('../services/authService');
const authModel = require('../models/authModel');
const { isValidEmail, isValidPassword } = require('../utils/validators');

async function register(req, res) {
  const { email, password, role, firstName, lastName, institution, function: func } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Gültige E-Mail-Adresse erforderlich' });
  }

  if (!password || !isValidPassword(password)) {
    return res.status(400).json({
      error: 'Passwort muss mindestens 8 Zeichen lang sein und Buchstaben sowie Zahlen enthalten',
    });
  }

  const existing = await authModel.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'E-Mail-Adresse wird bereits verwendet' });
  }

  try {
    const id = await authService.registerUser({
      email,
      password,
      role: role || 'user',
      firstName: firstName || '',
      lastName: lastName || '',
      institution: institution || '',
      func: func || '',
    });
    res.status(201).json({ message: 'Benutzer erfolgreich erstellt', id });
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Benutzers' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }

  const result = await authService.loginUser(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }

  res.json({
    message: 'Login successful',
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
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token fehlt' });
  }

  if (!password || !isValidPassword(password)) {
    return res.status(400).json({
      error: 'Passwort muss mindestens 8 Zeichen lang sein und Buchstaben sowie Zahlen enthalten',
    });
  }

  const success = await authService.setPasswordWithToken(token, password);
  if (!success) {
    return res.status(400).json({ error: 'Ungültiger oder abgelaufener Link' });
  }

  res.json({ message: 'Passwort erfolgreich gesetzt' });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Altes und neues Passwort erforderlich' });
  }

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      error: 'Neues Passwort muss mindestens 8 Zeichen lang sein und Buchstaben sowie Zahlen enthalten',
    });
  }

  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ message: 'Passwort erfolgreich geändert' });
}

async function verify(req, res) {
  const { email, private_key } = req.body;
  const token = await authService.verifyToken(email, private_key);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Valid' });
}

async function refresh(req, res) {
  const { email, private_key } = req.body;
  const refreshed = await authService.refreshToken(email, private_key);
  if (!refreshed) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Refreshed' });
}

async function logout(req, res) {
  const { email, private_key } = req.body;
  const loggedOut = await authService.logoutUser(email, private_key);
  if (!loggedOut) {
    return res.status(401).json({ error: 'Unauthorized' });
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

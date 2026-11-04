// Einfache Validierungs-Hilfsfunktionen fuer E-Mail und Passwort

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(trimmed);
}

function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  // Mindestens 8 Zeichen, mindestens 1 Buchstabe und mindestens 1 Zahl
  if (password.length < 8 || password.length > 128) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

module.exports = {
  isValidEmail,
  isValidPassword,
};

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.includes('@') && trimmed.includes('.');
}

function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

module.exports = {
  isValidEmail,
  isValidPassword,
};

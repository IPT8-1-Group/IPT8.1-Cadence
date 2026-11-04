const authModel = require('../models/authModel');

async function getUsers(req, res) {
  try {
    const users = await authModel.getAllUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Fehler beim Abrufen der Benutzer' });
  }
}

async function getUserById(req, res) {
  const { id } = req.params;
  const user = await authModel.findUserById(id);

  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  res.json(user);
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { role, active, firstName, lastName, institution } = req.body;
  const jobTitle = req.body.jobTitle !== undefined ? req.body.jobTitle : (req.body.job_title !== undefined ? req.body.job_title : (req.body.funktion !== undefined ? req.body.funktion : req.body.function));

  const user = await authModel.findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  // Wenn ein Konto deaktiviert wird, muessen aktive Sitzungen sofort beendet werden
  if (active === false) {
    await authModel.deleteTokensForUser(id);
  }

  const updated = await authModel.updateUser(id, {
    role,
    active,
    firstName,
    lastName,
    institution,
    jobTitle,
  });

  res.json(updated);
}

module.exports = {
  getUsers,
  getUserById,
  updateUser,
};


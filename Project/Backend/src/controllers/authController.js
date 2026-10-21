const authService = require('../services/authService');

async function register(req, res) {
  const { email, password } = req.body;
  try {
    await authService.registerUser(email, password);
    res.json({ message: 'User registered' });
  } catch {
    res.status(400).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const privateKey = await authService.loginUser(email, password);
  if (!privateKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Login successful', private_key: privateKey });
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
  verify,
  refresh,
  logout,
};

const jwt = require('jsonwebtoken');

const getToken = (req) => {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

// Exige un token JWT valide
const authenticateToken = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Renseigne req.user si un token valide est fourni, sans l'exiger
const optionalAuth = (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

const signToken = (user) => jwt.sign(
  { id: user.id, username: user.username, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

module.exports = { authenticateToken, optionalAuth, signToken };

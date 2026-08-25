const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Verifies the JWT, loads the current user, and attaches it to req.user.
 * Rejects if the account has been suspended (isActive = false) — FR3b.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isActive) return res.status(403).json({ error: 'Account suspended' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but does not reject the request otherwise. Useful for public
 * endpoints that behave slightly differently for logged-in clients
 * (e.g. showing "saved" state).
 */
async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user && user.isActive) req.user = user;
  } catch (_) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate };

const prisma = require('../config/db');

/**
 * requireRole(['MANAGER', 'ADMIN']) — base role gate.
 * Must run after authenticate().
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  };
}

/**
 * requirePermission('can_approve_gis') — checks per-account overrides
 * (FR3a). Falls back to a role-based default if no explicit row exists.
 * Only Admin can ever write to user_permissions (enforced in the admin
 * controller, not here — BR11).
 */
const ROLE_DEFAULTS = {
  ADMIN: {
    can_approve_property: true,
    can_approve_gis: true,
    can_approve_jobs: true,
    can_approve_market: true,
    can_approve_services: true,
  },
  MANAGER: {
    can_approve_property: true,
    can_approve_gis: false,
    can_approve_jobs: false,
    can_approve_market: true, // Market/Isoko defaults ON for Manager — high volume, low risk (Admin can override per account, FR3a)
    can_approve_services: true,
  },
  AGENT: {},
  CLIENT: {},
};

function requirePermission(permissionKey) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // Admin always passes.
    if (req.user.role === 'ADMIN') return next();

    const override = await prisma.userPermission.findUnique({
      where: { userId_permissionKey: { userId: req.user.id, permissionKey } },
    });

    const allowed = override
      ? override.value === 'true'
      : Boolean(ROLE_DEFAULTS[req.user.role]?.[permissionKey]);

    if (!allowed) return res.status(403).json({ error: `Missing permission: ${permissionKey}` });
    next();
  };
}

module.exports = { requireRole, requirePermission };

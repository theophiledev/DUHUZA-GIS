const bcrypt = require('bcrypt');
const { z } = require('zod');
const prisma = require('../config/db');

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      permissions: {
        select: { id: true, permissionKey: true, value: true, updatedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(users);
}

// FR1: Admin creates Agent/Manager accounts (no public signup for these roles)
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  password: z.string().min(8),
  role: z.enum(['AGENT', 'MANAGER', 'ADMIN']),
  preferredLanguage: z.enum(['EN', 'RW', 'SW']).optional(),
}).refine((d) => d.email || d.phone, { message: 'email or phone required' });

async function createUser(req, res) {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, phone, password, role, preferredLanguage } = parsed.data;

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role, preferredLanguage: preferredLanguage || 'EN' },
  });

  const { passwordHash: _omit, ...safe } = user;
  return res.status(201).json(safe);
}

// FR3a: grant/revoke specific privileges per account, overriding role defaults.
// Only Admin can call this route (enforced by requireRole(['ADMIN']) on the route) — BR11.
const permissionSchema = z.object({
  permissionKey: z.string().min(2),
  value: z.string(), // "true" / "false" / numeric string for quota-style permissions
});
async function setUserPermission(req, res) {
  const parsed = permissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const permission = await prisma.userPermission.upsert({
    where: { userId_permissionKey: { userId: targetUser.id, permissionKey: parsed.data.permissionKey } },
    update: { value: parsed.data.value, grantedById: req.user.id },
    create: {
      userId: targetUser.id,
      permissionKey: parsed.data.permissionKey,
      value: parsed.data.value,
      grantedById: req.user.id,
    },
  });

  return res.json(permission);
}

// FR3b: suspend/reactivate an account without deleting it
const statusSchema = z.object({ isActive: z.boolean() });
async function setUserStatus(req, res) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: parsed.data.isActive },
  });
  const { passwordHash, ...safe } = user;
  return res.json(safe);
}

module.exports = { listUsers, createUser, setUserPermission, setUserStatus };

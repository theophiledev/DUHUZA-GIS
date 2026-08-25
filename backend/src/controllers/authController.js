const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/db');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Clients can self-register. Agents/Managers are created by Admin only (FR1).
const clientRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  password: z.string().min(8),
  preferredLanguage: z.enum(['EN', 'RW', 'SW']).optional(),
}).refine((d) => d.email || d.phone, { message: 'email or phone required' });

async function register(req, res) {
  const parsed = clientRegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, phone, password, preferredLanguage } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) },
  });
  if (existing) return res.status(409).json({ error: 'Account already exists' });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: 'CLIENT', // public self-registration is always CLIENT
      preferredLanguage: preferredLanguage || 'EN',
    },
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: safeUser(user) });
}

const loginSchema = z.object({
  identifier: z.string(), // email or phone
  password: z.string(),
});

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] },
  });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.isActive) return res.status(403).json({ error: 'Account suspended' }); // FR3b

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  return res.json({ token, user: safeUser(user) });
}

// Stub — wire up real email/SMS OTP provider (e.g. Africa's Talking) here.
async function requestPasswordReset(req, res) {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: 'identifier required' });
  // TODO: generate OTP, store hashed+expiring, send via email/SMS.
  return res.json({ message: 'If an account exists, a reset code has been sent.' });
}

function safeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

module.exports = { register, login, requestPasswordReset };

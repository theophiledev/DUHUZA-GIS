const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/db');
const { sendPasswordResetEmail } = require('../utils/emailService');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// In-memory reset code cache: Map<string, { code: string, userId: string, expiresAt: number }>
const resetCodeStore = new Map();

// Clean up expired codes periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of resetCodeStore.entries()) {
    if (record.expiresAt < now) {
      resetCodeStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
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

/**
 * Request a 6-digit password reset code
 */
async function requestPasswordReset(req, res) {
  const { identifier } = req.body;
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return res.status(400).json({ error: 'Email or phone identifier required' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: cleanIdentifier, mode: 'insensitive' } },
        { phone: cleanIdentifier },
      ],
    },
  });

  if (!user) {
    // Return friendly generic message to prevent account enumeration
    return res.json({
      message: 'If an account exists, a 6-digit reset code has been sent.',
      identifier: cleanIdentifier,
    });
  }

  // Generate 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  resetCodeStore.set(user.id, { code, userId: user.id, identifier: cleanIdentifier, expiresAt });

  // Dispatch email safely
  if (user.email) {
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetCode: code,
      });
    } catch (err) {
      console.error('[AuthController] Failed to send reset email:', err.message);
    }
  }

  return res.json({
    message: 'If an account exists, a 6-digit reset code has been sent to your email or phone.',
    identifier: cleanIdentifier,
    expiresInMinutes: 15,
  });
}

/**
 * Verify 6-digit reset code
 */
async function verifyResetCode(req, res) {
  const { identifier, code } = req.body;
  if (!identifier || !code) {
    return res.status(400).json({ error: 'Identifier and reset code are required' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanCode = String(code).trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: cleanIdentifier, mode: 'insensitive' } },
        { phone: cleanIdentifier },
      ],
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification code' });
  }

  const record = resetCodeStore.get(user.id);
  if (!record || record.expiresAt < Date.now() || record.code !== cleanCode) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new one.' });
  }

  return res.json({ valid: true, message: 'Verification code is valid' });
}

/**
 * Reset password using verified code
 */
async function resetPassword(req, res) {
  const { identifier, code, newPassword } = req.body;
  if (!identifier || !code || !newPassword) {
    return res.status(400).json({ error: 'Identifier, code, and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanCode = String(code).trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: cleanIdentifier, mode: 'insensitive' } },
        { phone: cleanIdentifier },
      ],
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification code' });
  }

  const record = resetCodeStore.get(user.id);
  if (!record || record.expiresAt < Date.now() || record.code !== cleanCode) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new one.' });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Consume code
  resetCodeStore.delete(user.id);

  return res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
}

/**
 * Change password while authenticated
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return res.json({ message: 'Password changed successfully' });
}

/**
 * Get current user profile with role metrics
 */
async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      _count: {
        select: {
          listings: true,
          gisRequestsMade: true,
          gisRequestsAssigned: true,
          jobsPosted: true,
          applications: true,
          marketItems: true,
        },
      },
    },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({ user: safeUser(user), counts: user._count });
}

/**
 * Update personal profile details
 */
async function updateProfile(req, res) {
  const { name, phone, preferredLanguage } = req.body;

  const updateData = {};
  if (name && typeof name === 'string' && name.trim().length >= 2) {
    updateData.name = name.trim();
  }
  if (phone !== undefined) {
    updateData.phone = phone ? String(phone).trim() : null;
  }
  if (preferredLanguage && ['EN', 'RW', 'SW'].includes(preferredLanguage)) {
    updateData.preferredLanguage = preferredLanguage;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid profile fields provided for update' });
  }

  // Check phone uniqueness if changed
  if (updateData.phone) {
    const existing = await prisma.user.findFirst({
      where: {
        phone: updateData.phone,
        id: { not: req.user.id },
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'Phone number is already associated with another account' });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
  });

  return res.json({ user: safeUser(updatedUser), message: 'Profile updated successfully' });
}

function safeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
};

import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
  path: '/',
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3).optional(),
});

/**
 * Self-service user registration (Anyone can create an account)
 */
router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();
    const generatedUsername = data.username?.trim() || normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    // Check existing email or username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: generatedUsername }],
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === normalizedEmail ? 'An account with this email already exists' : 'This username is already taken',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: generatedUsername,
        passwordHash,
        fullName: data.fullName.trim(),
        role: 'USER',
        isActive: true,
      },
      select: { id: true, email: true, username: true, fullName: true, role: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any }
    );

    res.cookie('token', token, getCookieOptions());

    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_SIGNUP',
        details: { email: newUser.email },
        ipAddress: req.ip || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * User Login (accepts username OR email)
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email and password required' });
    }

    const identifier = username.trim();
    const isEmail = identifier.includes('@');

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: identifier, mode: 'insensitive' } }
        : { username: { equals: identifier, mode: 'insensitive' } },
    });

    if (!user || !user.passwordHash) {
      await prisma.auditLog.create({
        data: { action: 'LOGIN_FAILED', details: { identifier, reason: 'User not found' }, ipAddress: req.ip || '' },
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      await prisma.auditLog.create({
        data: { action: 'LOGIN_FAILED', details: { identifier, reason: 'Account disabled' }, ipAddress: req.ip || '' },
      });
      return res.status(403).json({ success: false, message: 'Account is disabled. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await prisma.auditLog.create({
        data: { action: 'LOGIN_FAILED', details: { identifier, reason: 'Invalid password' }, ipAddress: req.ip || '' },
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any }
    );

    res.cookie('token', token, getCookieOptions());

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN_SUCCESS', ipAddress: req.ip || '' },
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Forgot password request
 */
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Always respond with success to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account with this email exists, password reset instructions have been dispatched.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Reset password update
 */
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and password (min 6 chars) required' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: string };
      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash },
      });

      res.json({ success: true, message: 'Password updated successfully. You can now login.' });
    } catch {
      return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/logout', optionalAuthenticate, async (req: AuthRequest, res) => {
  res.clearCookie('token', getCookieOptions());

  if (req.user) {
    try {
      await prisma.auditLog.create({
        data: { userId: req.user.id, action: 'LOGOUT', ipAddress: req.ip || '' },
      });
    } catch {
      // Non-blocking audit log
    }
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;

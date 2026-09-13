import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { getAdminStats } from '../controllers/adminController';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, requireAdmin);

// Live statistics endpoint
router.get('/stats', getAdminStats);

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['ADMIN', 'USER']),
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/users', async (req: AuthRequest, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email || `${data.username.toLowerCase()}@local.user`,
        passwordHash,
        fullName: data.fullName,
        role: data.role,
      },
      select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_USER',
        details: { targetUsername: data.username, role: data.role },
        ipAddress: req.ip || '',
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_USER_ROLE',
        details: { targetUserId: id, newRole: role },
        ipAddress: req.ip || '',
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/password', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'RESET_PASSWORD',
        details: { targetUserId: id },
        ipAddress: req.ip || '',
      },
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/enable', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;

    await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'ENABLE_USER',
        details: { targetUserId: id },
        ipAddress: req.ip || '',
      },
    });

    res.json({ success: true, message: 'User enabled' });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/disable', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;

    if (id === req.user!.id) {
      return res.status(400).json({ success: false, message: 'Cannot disable yourself' });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DISABLE_USER',
        details: { targetUserId: id },
        ipAddress: req.ip || '',
      },
    });

    res.json({ success: true, message: 'User disabled' });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

export default router;

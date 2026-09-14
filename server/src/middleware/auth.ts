import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email?: string;
  };
}

/**
 * Extracts JWT token from either httpOnly cookies or Authorization header (Bearer token)
 */
function extractToken(req: Request): string | null {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Verifies a token against either local JWT secret or Supabase Auth API
 */
async function verifyUserToken(token: string): Promise<{ id: string; role: Role; email?: string } | null> {
  // 1. Try local Express JWT verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      id?: string;
      sub?: string;
      role?: string;
      email?: string;
    };

    const userId = decoded.id || decoded.sub;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true, email: true },
      });
      if (user && user.isActive) {
        return { id: user.id, role: user.role, email: user.email || undefined };
      }
    }
  } catch {
    // Not a valid local Express JWT, proceed to check Supabase
  }

  // 2. Check Supabase Auth API if configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: serviceKey,
        },
      });

      if (response.ok) {
        const sbUser = (await response.json()) as {
          id: string;
          email?: string;
          user_metadata?: { full_name?: string; role?: string };
        };

        if (sbUser && sbUser.id) {
          // Check if this user exists in Prisma
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { id: sbUser.id },
                ...(sbUser.email ? [{ email: sbUser.email }] : []),
              ],
            },
            select: { id: true, role: true, isActive: true, email: true },
          });

          // Auto-sync Supabase user into Prisma if not present
          if (!user) {
            try {
              const defaultUsername = (sbUser.email?.split('@')[0] || `user_${sbUser.id.substring(0, 8)}`).replace(/[^a-zA-Z0-9_]/g, '_');
              user = await prisma.user.create({
                data: {
                  id: sbUser.id,
                  email: sbUser.email || `${sbUser.id}@supabase.auth`,
                  username: `${defaultUsername}_${Math.floor(Math.random() * 1000)}`,
                  fullName: sbUser.user_metadata?.full_name || defaultUsername,
                  role: sbUser.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'USER',
                  isActive: true,
                },
                select: { id: true, role: true, isActive: true, email: true },
              });
            } catch {
              user = await prisma.user.findFirst({
                where: {
                  OR: [
                    { id: sbUser.id },
                    ...(sbUser.email ? [{ email: sbUser.email }] : []),
                  ],
                },
                select: { id: true, role: true, isActive: true, email: true },
              });
            }
          }

          if (user) {
            if (!user.isActive) {
              return null;
            }
            return { id: user.id, role: user.role, email: user.email || undefined };
          }

          return {
            id: sbUser.id,
            role: (sbUser.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'USER') as Role,
            email: sbUser.email,
          };
        }
      }
    } catch {
      // Supabase verification error
    }
  }

  return null;
}

/**
 * Authenticates the user. Fails with 401/403 if token is missing, expired, or user disabled.
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const verifiedUser = await verifyUserToken(token);

    if (!verifiedUser) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication: Attaches req.user if a valid token is present, but doesn't block unauthenticated requests.
 */
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (token) {
      const verifiedUser = await verifyUserToken(token);
      if (verifiedUser) {
        req.user = verifiedUser;
      }
    }
  } catch {
    // Ignore error for optional authentication
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

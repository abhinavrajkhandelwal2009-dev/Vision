import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SafeUser, UserRole } from './types.ts';
import { db } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'vision-intelligence-secure-jwt-secret-2026';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export function generateToken(user: SafeUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: missing or malformed Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User record not found or session expired.' });
    }
    req.user = db.toSafeUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' lacks sufficient privileges for this action.`
      });
    }
    next();
  };
}

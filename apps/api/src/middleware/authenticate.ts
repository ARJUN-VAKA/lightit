import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw createError('Authentication required', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id, status: 'ACTIVE' },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) throw createError('User not found or suspended', 401);

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    if (err instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
    } else {
      next(err);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403));
    }
    next();
  };
};

export const requireFounder = requireRole('FOUNDER', 'ADMIN');
export const requireInvestor = requireRole('INVESTOR', 'ADMIN');
export const requireAdmin = requireRole('ADMIN');

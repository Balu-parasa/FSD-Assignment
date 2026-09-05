import type { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/user.js';
import { respond } from '../utils/api.js';
import { verifyAccessToken } from '../utils/tokens.js';
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return respond(res, 401, 'Authentication required');
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub);
    if (!user) return respond(res, 401, 'Session is no longer valid');
    req.user = user;
    next();
  } catch {
    return respond(res, 401, 'Authentication required');
  }
};
export const requireRole =
  (...roles: Array<'admin' | 'member'>) =>
  (req: Request, res: Response, next: NextFunction) =>
    req.user && roles.includes(req.user.role as 'admin' | 'member')
      ? next()
      : respond(res, 403, 'Insufficient permissions');

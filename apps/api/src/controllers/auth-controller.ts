import type { Request, Response } from 'express';
import { UserModel, hashPassword, matchesPassword } from '../models/user.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';
import { respond } from '../utils/api.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
const session = async (user: InstanceType<typeof UserModel>) => {
  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  user.refreshToken = refreshToken;
  await user.save();
  return { user: user.toJSON(), accessToken, refreshToken };
};
export const register = async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const existing = await UserModel.exists({ email: input.email });
  if (existing) return respond(res, 409, 'Email already in use');
  const user = await UserModel.create({
    ...input,
    passwordHash: await hashPassword(input.password),
  });
  return respond(res, 201, 'Account created', await session(user));
};
export const login = async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  req.log.info({ email: input.email }, 'Login attempt received');
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !(await matchesPassword(input.password, String(user.passwordHash))))
    return respond(res, 401, 'Invalid email or password');
  return respond(res, 200, 'Signed in', await session(user));
};
export const refresh = async (req: Request, res: Response) => {
  const token = req.body.refreshToken as string | undefined;
  if (!token) return respond(res, 401, 'Refresh token required');
  try {
    const payload = verifyRefreshToken(token);
    const user = await UserModel.findById(payload.sub).select('+refreshToken');
    if (!user || user.refreshToken !== token) return respond(res, 401, 'Invalid refresh token');
    return respond(res, 200, 'Token refreshed', { accessToken: createAccessToken(user.id) });
  } catch {
    return respond(res, 401, 'Invalid refresh token');
  }
};
export const logout = async (req: Request, res: Response) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }
  return respond(res, 200, 'Signed out');
};
export const forgotPassword = async (req: Request, res: Response) => {
  const email = loginSchema.shape.email.parse(req.body.email);
  const user = await UserModel.findOne({ email });
  if (user) req.log.info({ email }, 'Mock password reset email queued');
  return respond(res, 200, 'If an account exists, reset instructions have been sent');
};
export const profile = async (req: Request, res: Response) =>
  respond(res, 200, 'Profile retrieved', req.user);
export const updateProfile = async (req: Request, res: Response) => {
  const values = registerSchema
    .pick({ name: true })
    .extend({ avatarUrl: z.string().url().optional() })
    .parse(req.body);
  Object.assign(req.user!, values);
  await req.user!.save();
  return respond(res, 200, 'Profile updated', req.user);
};
import { z } from 'zod';

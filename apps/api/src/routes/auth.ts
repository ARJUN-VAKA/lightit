import { Router } from 'express';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { sendVerificationEmail, sendOTPEmail } from '../lib/email';

const router = Router();

// ─── Register ─────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role, name, phone } = req.body;

    if (!email || !password || !role || !name) {
      throw createError('Email, password, role, and name are required', 400);
    }

    if (!['FOUNDER', 'INVESTOR'].includes(role)) {
      throw createError('Invalid role', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw createError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    let user: any;
    if (role === 'FOUNDER') {
      user = await prisma.user.create({
        data: {
          email, passwordHash, role,
          status: 'ACTIVE', emailVerified: true,
          founder: { create: { name, phone } },
        },
        include: { founder: true, investor: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email, passwordHash, role,
          status: 'ACTIVE', emailVerified: true,
          investor: {
            create: {
              name, phone,
              investmentCapacityMin: 0,
              investmentCapacityMax: 0,
              preferredSectors: '[]',
              preferredLocations: '[]',
              preferredStages: '[]',
            },
          },
        },
        include: { founder: true, investor: true },
      });
    }

    // Auto-login: generate tokens so frontend redirects directly to dashboard
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.founder?.name || user.investor?.name,
          emailVerified: true,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Login ────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) throw createError('Email and password required', 400);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { founder: true, investor: true },
    });

    if (!user || !user.passwordHash) {
      throw createError('Invalid credentials', 401);
    }

    if (role && user.role !== role && user.role !== 'ADMIN') {
      throw createError('Invalid credentials for this portal', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw createError('Invalid credentials', 401);

    if (user.status === 'SUSPENDED') {
      throw createError('Account suspended. Contact support.', 403);
    }

    // Handle 2FA
    if (user.twoFactorEnabled) {
      const tempToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
      return res.json({
        success: true,
        requiresTwoFactor: true,
        tempToken,
      });
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date(), status: 'ACTIVE' },
    });

    // Audit log
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', resource: 'auth', ipAddress: req.ip },
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.founder?.name || user.investor?.name,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Refresh Token ────────────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError('Refresh token required', 400);

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id, refreshToken },
    });

    if (!user) throw createError('Invalid refresh token', 401);

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    next(err);
  }
});

// ─── Verify Email ─────────────────────────────────────────────
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    // Decode token (userId encoded in base64)
    const userId = Buffer.from(token, 'base64').toString();
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
    });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Setup 2FA ────────────────────────────────────────────────
router.post('/2fa/setup', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `LightIt (${req.user!.email})`,
      length: 32,
    });

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ success: true, data: { qrCode: qrCodeUrl, secret: secret.base32 } });
  } catch (err) {
    next(err);
  }
});

// ─── Enable 2FA ───────────────────────────────────────────────
router.post('/2fa/enable', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { otp } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.twoFactorSecret) throw createError('2FA not set up', 400);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 2,
    });

    if (!verified) throw createError('Invalid OTP', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Verify 2FA Login ─────────────────────────────────────────
router.post('/2fa/verify', async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;
    const decoded = verifyRefreshToken(tempToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user?.twoFactorSecret) throw createError('2FA not set up', 400);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 2,
    });

    if (!verified) throw createError('Invalid OTP', 401);

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    res.json({ success: true, data: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
});

// ─── Logout ───────────────────────────────────────────────────
router.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { refreshToken: null },
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── Get Current User ─────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        founder: { include: { startup: true } },
        investor: { include: { subscription: true } },
      },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;

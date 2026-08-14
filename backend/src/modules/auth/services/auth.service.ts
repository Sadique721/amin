import { OTP } from '../models/otp.model';
import { UserRepository } from '../../users/repositories/user.repository';
import { emailQueue } from '@/queues/email.queue';
import { signToken } from '@/shared/auth/jwt';
import { env } from '@/config/env';
import { BadRequestException } from '@/shared/exceptions';
import { hashPassword, comparePassword } from '@/shared/auth/password';
import { Session } from '../models/session.model';
import { parseUserAgent } from '@/shared/auth/ua';
import crypto from 'crypto';

export class AuthService {
  private userRepository = new UserRepository();

  async requestOtp(email: string): Promise<{ hasPassword: boolean }> {
    const formattedEmail = email.toLowerCase().trim();
    const adminEmail = env.ADMIN_EMAIL ? env.ADMIN_EMAIL.toLowerCase().trim() : '';
    
    const user = await this.userRepository.findByEmail(formattedEmail);
    const hasPassword = !!(user?.password) || !!(adminEmail && formattedEmail === adminEmail);

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Upsert OTP in database
    await OTP.findOneAndUpdate(
      { email: formattedEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Dispatch background email job to Nodemailer worker
    await emailQueue.add({ type: 'otp', email: formattedEmail, otp });

    return {
      hasPassword,
    };
  }


  async verifyOtp(email: string, otpCode: string, meta?: { ip: string; userAgent: string }) {
    const formattedEmail = email.toLowerCase().trim();
    const adminEmail = env.ADMIN_EMAIL ? env.ADMIN_EMAIL.toLowerCase().trim() : '';
    const adminPassword = env.ADMIN_PASSWORD;
    
    let user = await this.userRepository.findByEmail(formattedEmail);

    // Allow admin password login via verify endpoint only if ADMIN_PASSWORD is set in env
    const isAdminLogin = !!(adminEmail && adminPassword && formattedEmail === adminEmail && otpCode === adminPassword);

    if (isAdminLogin) {
      if (!user) {
        user = await this.userRepository.create({
          name: 'Amin Administrator',
          email: formattedEmail,
          role: 'admin',
          isEmailVerified: true,
          password: await hashPassword(adminPassword),
        });
      }
      
      const payload = { sub: user._id.toString(), role: user.role };
      const accessToken = signToken(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
      const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
      
      await this.createSession(user._id.toString(), accessToken, meta);
      
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      };
    }

    // Check if user has password set and matches
    if (user && user.password) {
      const isMatch = await comparePassword(otpCode, user.password);
      if (isMatch) {
        const payload = { sub: user._id.toString(), role: user.role };
        const accessToken = signToken(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
        const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
        
        await this.createSession(user._id.toString(), accessToken, meta);
        
        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        };
      }
    }

    // Verify OTP code from database
    const otpRecord = await OTP.findOne({ email: formattedEmail, otp: otpCode });
    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const defaultName = formattedEmail.split('@')[0];
      user = await this.userRepository.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: formattedEmail,
        role: formattedEmail === adminEmail ? 'admin' : 'customer',
        isEmailVerified: true,
      });
      try {
        await emailQueue.add({ type: 'welcome', email: user.email, name: user.name });
      } catch (e) {}
    }

    const payload = { sub: user._id.toString(), role: user.role };
    
    const accessToken = signToken(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    
    const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    await this.createSession(user._id.toString(), accessToken, meta);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(credential: string, meta?: { ip: string; userAgent: string }) {
    try {
      const parts = credential.split('.');
      if (parts.length !== 3) {
        throw new BadRequestException('Invalid Google credential format');
      }
      
      let payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4) {
        payloadBase64 += '=';
      }
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      
      if (!payload.email || !payload.sub) {
        throw new BadRequestException('Invalid Google token payload');
      }
      
      const email = payload.email.toLowerCase();
      const googleId = payload.sub;
      const name = payload.name || email.split('@')[0];
      
      let user = await this.userRepository.findByGoogleId(googleId);
      if (!user) {
        user = await this.userRepository.findByEmail(email);
        if (user) {
          user = await this.userRepository.update(user._id.toString(), { googleId, isEmailVerified: true });
        } else {
          user = await this.userRepository.create({
            name,
            email,
            googleId,
            isEmailVerified: true,
            role: email === (env.ADMIN_EMAIL || 'admin@amin.com').toLowerCase() ? 'admin' : 'customer',
          });
        }
      }

      if (!user) {
        throw new BadRequestException('Failed to process Google authentication');
      }

      const jwtPayload = { sub: user._id.toString(), role: user.role };
      const accessToken = signToken(jwtPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
      const refreshToken = signToken(jwtPayload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

      await this.createSession(user._id.toString(), accessToken, meta);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Google authentication failed');
    }
  }

  async createSession(userId: string, accessToken: string, meta?: { ip: string; userAgent: string }) {
    try {
      const uaInfo = parseUserAgent(meta?.userAgent || '');
      const hashedToken = crypto.createHash('sha256').update(accessToken).digest('hex');

      await Session.create({
        user: userId,
        token: hashedToken,
        ipAddress: meta?.ip || '127.0.0.1',
        device: `${uaInfo.os} Device`,
        browser: uaInfo.browser,
        os: uaInfo.os,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    } catch (e) {
      // Non-blocking error logging for session table insertion
    }
  }
}

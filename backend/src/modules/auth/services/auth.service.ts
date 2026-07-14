import { OTP } from '../models/otp.model';
import { UserRepository } from '../../users/repositories/user.repository';
import { EmailService } from '@/shared/email';
import { signToken } from '@/shared/auth/jwt';
import { env } from '@/config/env';
import { BadRequestException } from '@/shared/exceptions';

export class AuthService {
  private userRepository = new UserRepository();

  async requestOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await EmailService.sendOTP(email, otp);
  }

  async verifyOtp(email: string, otpCode: string) {
    const formattedEmail = email.toLowerCase();
    
    const otpRecord = await OTP.findOne({ email: formattedEmail, otp: otpCode });
    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('OTP has expired');
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    let user = await this.userRepository.findByEmail(formattedEmail);
    if (!user) {
      const defaultName = formattedEmail.split('@')[0];
      user = await this.userRepository.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: formattedEmail,
        role: 'customer',
      });
    }

    const payload = { sub: user._id, role: user.role };
    
    const accessToken = signToken(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    
    const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

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

  async googleLogin(credential: string) {
    try {
      const parts = credential.split('.');
      if (parts.length !== 3) {
        throw new BadRequestException('Invalid Google credential format');
      }
      
      // Decode the payload from base64
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
          user = await this.userRepository.update(user.id, { googleId, isEmailVerified: true });
        } else {
          user = await this.userRepository.create({
            name,
            email,
            googleId,
            role: 'customer',
            isEmailVerified: true,
          });
        }
      }
      
      const tokenPayload = { sub: user!._id, role: user!.role };
      const accessToken = signToken(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
      const refreshToken = signToken(tokenPayload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
      
      return {
        user: {
          id: user!._id,
          name: user!.name,
          email: user!.email,
          role: user!.role,
          isActive: user!.isActive,
          isEmailVerified: user!.isEmailVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Google authentication failed');
    }
  }
}

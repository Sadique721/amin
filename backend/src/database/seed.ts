import { User } from '@/modules/users/models/user.model';
import { env } from '@/config/env';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const seedDefaultAdmin = async (): Promise<void> => {
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not specified in env. Skipping default admin seeding.');
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.password = hashPassword(adminPassword);
      await existingAdmin.save();
      console.log('✅ Default admin updated successfully.');
      return;
    }

    await User.create({
      name: 'Store Administrator',
      email: adminEmail.toLowerCase(),
      role: 'admin',
      password: hashPassword(adminPassword),
      isEmailVerified: true,
      isActive: true,
    });
    console.log(`✅ Default admin created successfully: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to seed default admin user:', (error as Error).message);
  }
};

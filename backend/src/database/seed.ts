import { User } from '@/modules/users/models/user.model';
import { Banner } from '@/modules/cms/models/banner.model';
import { Faq } from '@/modules/cms/models/faq.model';
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

export const seedCmsData = async (): Promise<void> => {
  try {
    const bannersCount = await Banner.countDocuments();
    if (bannersCount === 0) {
      await Banner.create([
        {
          title: 'Timeless Elegance & Bespoke Diamonds',
          subtitle: 'Pure 18k & 22k Gold Fine Jewellery',
          desktopImage: {
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
            publicId: 'seed-hero-jewellery',
          },
          linkUrl: '/shop?category=jewellery',
          order: 1,
          type: 'hero',
          isActive: true,
        },
        {
          title: 'Clinically Formulated Skincare & Glosses',
          subtitle: 'Premium Cosmetics & Botanical Extracts',
          desktopImage: {
            url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
            publicId: 'seed-hero-cosmetics',
          },
          linkUrl: '/shop?category=cosmetics',
          order: 2,
          type: 'hero',
          isActive: true,
        },
        {
          title: 'Premium Festive Gold Collection',
          subtitle: 'Get up to 20% off on Bridal Sets',
          desktopImage: {
            url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop',
            publicId: 'seed-promo-bridal',
          },
          linkUrl: '/shop?category=bridal',
          order: 1,
          type: 'promotional',
          isActive: true,
        },
        {
          title: 'Luxury Lip & Glow Sets',
          subtitle: 'Organic formulations, cruelty-free certification',
          desktopImage: {
            url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
            publicId: 'seed-promo-glow',
          },
          linkUrl: '/shop?category=lip-glow',
          order: 2,
          type: 'promotional',
          isActive: true,
        }
      ]);
      console.log('✅ Default CMS banners seeded successfully.');
    }

    const faqsCount = await Faq.countDocuments();
    if (faqsCount === 0) {
      await Faq.create([
        {
          question: 'Are your gold and diamond jewellery items certified?',
          answer: 'Yes! All our fine jewellery items are 100% BIS Hallmarked and diamonds are certified by reputed international labs like IGI and GIA, ensuring supreme quality and trust.',
          order: 1,
          isActive: true,
        },
        {
          question: 'What is your shipping and return policy?',
          answer: 'We offer free insured delivery across all domestic locations. For returns, we have a hassle-free 14-day replacement/refund policy on unused products with original tags intact.',
          order: 2,
          isActive: true,
        },
        {
          question: 'Are your cosmetics cruelty-free and dermatologically tested?',
          answer: 'Absolutely. All our skincare and makeup products are 100% cruelty-free, dermatologically evaluated, hypoallergenic, and free from parabens or harsh synthetics.',
          order: 3,
          isActive: true,
        }
      ]);
      console.log('✅ Default CMS FAQs seeded successfully.');
    }
  } catch (error) {
    console.error('❌ Failed to seed default CMS data:', (error as Error).message);
  }
};

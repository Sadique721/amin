import { User } from '@/modules/users/models/user.model';
import { Banner } from '@/modules/cms/models/banner.model';
import { Faq } from '@/modules/cms/models/faq.model';
import { Category } from '@/modules/categories/models/category.model';
import { Product } from '@/modules/products/models/product.model';
import { env } from '@/config/env';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { hashPassword as bcryptHashPassword } from '@/shared/auth/password';

export const seedDefaultAdmin = async (): Promise<void> => {
  // 1. Seed requested admin user
  try {
    const adminEmail = 'mdsadiqueamin721786@gmail.com';
    const adminPassHash = await bcrypt.hash('Sadique@123', 10);
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (!existingAdmin) {
      await User.create({
        name: 'Md Sadique Amin',
        email: adminEmail.toLowerCase(),
        phone: '9318302850',
        role: 'admin',
        password: adminPassHash,
        isEmailVerified: true,
        isActive: true,
      });
      console.log(`✅ Custom admin created successfully: ${adminEmail}`);
    } else {
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassHash;
      existingAdmin.name = 'Md Sadique Amin';
      existingAdmin.phone = '9318302850';
      await existingAdmin.save();
      console.log(`✅ Custom admin details updated: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Failed to seed custom admin:', (error as Error).message);
  }

  // 2. Seed requested customer user
  try {
    const customerEmail = 'mdsadiqueamin721721@gmail.com';
    const customerPassHash = await bcrypt.hash('Amin@123', 10);
    const existingCustomer = await User.findOne({ email: customerEmail.toLowerCase() });
    
    if (!existingCustomer) {
      await User.create({
        name: 'Md Sadique Amin',
        email: customerEmail.toLowerCase(),
        phone: '9318302850',
        role: 'customer',
        password: customerPassHash,
        isEmailVerified: true,
        isActive: true,
      });
      console.log(`✅ Custom customer created successfully: ${customerEmail}`);
    } else {
      existingCustomer.role = 'customer';
      existingCustomer.password = customerPassHash;
      existingCustomer.name = 'Md Sadique Amin';
      existingCustomer.phone = '9318302850';
      await existingCustomer.save();
      console.log(`✅ Custom customer details updated: ${customerEmail}`);
    }
  } catch (error) {
    console.error('❌ Failed to seed custom customer:', (error as Error).message);
  }

  // 3. Original ENV-based default admin seeding
  const defaultAdminEmail = env.ADMIN_EMAIL;
  const defaultAdminPassword = env.ADMIN_PASSWORD;

  if (!defaultAdminEmail || !defaultAdminPassword) {
    console.log('⚠️ env.ADMIN_EMAIL or env.ADMIN_PASSWORD not specified. Skipping ENV-based admin.');
    return;
  }

  try {
    const existingDefault = await User.findOne({ email: defaultAdminEmail.toLowerCase() });
    if (existingDefault) {
      existingDefault.role = 'admin';
      existingDefault.password = await bcryptHashPassword(defaultAdminPassword);
      await existingDefault.save();
      console.log('✅ Default env-admin updated successfully.');
      return;
    }

    await User.create({
      name: 'Store Administrator',
      email: defaultAdminEmail.toLowerCase(),
      role: 'admin',
      password: await bcryptHashPassword(defaultAdminPassword),
      isEmailVerified: true,
      isActive: true,
    });
    console.log(`✅ Default env-admin created successfully: ${defaultAdminEmail}`);
  } catch (error) {
    console.error('❌ Failed to seed default env-admin user:', (error as Error).message);
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

export const seedProductsAndCategories = async (): Promise<void> => {
  try {
    const praoProductCount = await Product.countDocuments({ brand: 'PRAO Paris' });

    if (praoProductCount >= 10) {
      console.log('✅ PRAO collection and demo products are already fully seeded in database.');
      return;
    }

    // Clear existing to avoid duplicate conflicts if seeding is incomplete
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed Categories
    const categoriesData = [
      { name: 'Gold Rings', description: 'Fine 18k and 22k gold rings' },
      { name: 'Diamond Necklaces', description: 'Ethically sourced diamond pendants and necklaces' },
      { name: 'Luxury Earrings', description: 'Elegant studs, drops, and hoops' },
      { name: 'Anti-Tarnish Earrings', description: 'Waterproof 18k gold plated anti-tarnish fashion earrings' },
      { name: 'Hoops & Huggies', description: 'Classic and modern anti-tarnish hoop earrings' },
      { name: 'Jhumkas & Chaandbalis', description: 'Handcrafted traditional and oxidized jhumka dangles' },
      { name: 'Minimalist Studs', description: 'Everyday waterproof geometric and floral studs' },
      { name: 'Fine Bracelets', description: 'Gold and diamond wristwear' },
      { name: 'Matte Lipsticks', description: 'Highly pigmented luxury lip cosmetics' },
      { name: 'Liquid Foundations', description: 'Dermatologically safe natural coverage' },
      { name: 'Natural Skin Creams', description: 'Premium botanical face and skin formulations' },
      { name: 'Eye Shadow Palettes', description: 'Vibrant organic eye shadows' },
    ];

    const seededCategories = await Category.create(categoriesData);
    console.log(`✅ Seeded ${seededCategories.length} product categories.`);

    // Find category map
    const catMap = seededCategories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {} as Record<string, any>);

    // Demo Products List
    const productsData: any[] = [];

    // --- JEWELLERY PRODUCTS (15 Items) ---
    const jwlProducts = [
      {
        name: 'Eternal Diamond Engagement Ring',
        category: catMap['Gold Rings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A brilliant-cut 1.5 carat solitaire diamond set on an 18K yellow gold band. The ultimate symbol of everlasting love.',
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-RG-001', price: 75000, compareAtPrice: 85000, stock: 12, attributes: { metal: '18K Yellow Gold', size: 6 }, isActive: true },
          { sku: 'SNB-JWL-RG-002', price: 77000, compareAtPrice: 88000, stock: 8, attributes: { metal: '18K White Gold', size: 7 }, isActive: true }
        ]
      },
      {
        name: 'Royal Halo Sapphire Studs',
        category: catMap['Luxury Earrings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'Vibrant blue oval sapphires surrounded by a dazzling halo of micro-pave diamonds in 18K white gold.',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-ER-001', price: 95000, compareAtPrice: 110000, stock: 5, attributes: { metal: '18K White Gold' }, isActive: true }
        ]
      },
      {
        name: 'Classic Gold Eternity Band',
        category: catMap['Gold Rings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'An elegant eternity ring crafted in pure 22K yellow gold with hand-engraved traditional filigree carvings.',
        images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-RG-003', price: 35000, compareAtPrice: 42000, stock: 20, attributes: { metal: '22K Yellow Gold', size: 7 }, isActive: true }
        ]
      },
      {
        name: 'Ornate Floral Pendant Necklace',
        category: catMap['Diamond Necklaces'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A beautiful rose-shaped gold pendant encrusted with fine pave diamonds, hung on an adjustable 18K gold chain.',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-NK-001', price: 62000, compareAtPrice: 70000, stock: 6, attributes: { metal: '18K Rose Gold' }, isActive: true }
        ]
      },
      {
        name: 'Empress Diamond Choker',
        category: catMap['Diamond Necklaces'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A statement high-jewelry choker necklace containing over 10 carats of ethically sourced brilliant round diamonds.',
        images: ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-NK-002', price: 450000, compareAtPrice: 520000, stock: 2, attributes: { metal: 'Platinum' }, isActive: true }
        ]
      },
      {
        name: 'Minimalist Gold Link Bracelet',
        category: catMap['Fine Bracelets'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A lightweight everyday paperclip chain link bracelet in pure 18K yellow gold. Sleek and perfect for stacking.',
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-BR-001', price: 28000, compareAtPrice: 33000, stock: 15, attributes: { metal: '18K Yellow Gold' }, isActive: true }
        ]
      },
      {
        name: 'Teardrop Emerald Drop Earrings',
        category: catMap['Luxury Earrings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'Exquisite Zambian pear emeralds dangling from diamond-set huggie loops in 18K yellow gold.',
        images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-ER-002', price: 125000, compareAtPrice: 140000, stock: 4, attributes: { metal: '18K Yellow Gold' }, isActive: true }
        ]
      },
      {
        name: 'Dainty Diamond Tennis Bracelet',
        category: catMap['Fine Bracelets'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A timeless single row of brilliant round-cut diamonds set in a secure four-prong 18K white gold mounting.',
        images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-BR-002', price: 180000, compareAtPrice: 200000, stock: 3, attributes: { metal: '18K White Gold' }, isActive: true }
        ]
      },
      {
        name: 'Crown Solitaire Ring',
        category: catMap['Gold Rings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A majestic crown-inspired ring with a 1-carat round diamond supported by a tiara-shaped pave set band.',
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-RG-004', price: 89000, compareAtPrice: 99000, stock: 7, attributes: { metal: '18K Rose Gold', size: 6 }, isActive: true }
        ]
      },
      {
        name: 'Vintage Gold Filigree Bangle',
        category: catMap['Fine Bracelets'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A broad, traditional Indian filigree bangle handcrafted in solid 22K yellow gold. Features screw lock mechanisms.',
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-BR-003', price: 115000, compareAtPrice: 130000, stock: 6, attributes: { metal: '22K Yellow Gold' }, isActive: true }
        ]
      },
      {
        name: 'Heart Silhouette Locket',
        category: catMap['Diamond Necklaces'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'A delicate opening heart-shaped gold locket with micro diamonds tracing the edge. Space for two custom photos.',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-NK-003', price: 42000, compareAtPrice: 48000, stock: 11, attributes: { metal: '18K Yellow Gold' }, isActive: true }
        ]
      },
      {
        name: 'Contemporary Geometric Studs',
        category: catMap['Luxury Earrings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'Sleek triangular studs crafted in 18K gold featuring baguette-cut diamonds in channel settings.',
        images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-ER-003', price: 54000, compareAtPrice: 62000, stock: 9, attributes: { metal: '18K Yellow Gold' }, isActive: true }
        ]
      },
      {
        name: 'Art Deco Diamond Bangle',
        category: catMap['Fine Bracelets'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'Inspired by 1920s architecture, this 18K white gold bangle features alternating princess and baguette diamonds.',
        images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-BR-004', price: 210000, compareAtPrice: 240000, stock: 2, attributes: { metal: '18K White Gold' }, isActive: true }
        ]
      },
      {
        name: 'Twisted Gold Hoop Earrings',
        category: catMap['Luxury Earrings'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        description: 'Chic, medium-sized hoop earrings featuring a hand-twisted rope motif in high-polish 18K yellow gold.',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-ER-004', price: 32000, compareAtPrice: 38000, stock: 14, attributes: { metal: '18K Yellow Gold' }, isActive: true }
        ]
      },
      {
        name: 'Infinity Pearl Pendant',
        category: catMap['Diamond Necklaces'],
        brand: 'SANAB Atelier',
        type: 'jewellery',
        tags: ['necklace', 'pearl', 'diamond'],
        description: 'A shimmering white South Sea pearl suspended inside a diamond-studded infinity loop in 18K rose gold.',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-JWL-NK-004', price: 48000, compareAtPrice: 55000, stock: 10, attributes: { metal: '18K Rose Gold' }, isActive: true }
        ]
      },
      // --- PRAO ANTI-TARNISH EARRINGS COLLECTION ---
      {
        name: 'PRAO Anti-Tarnish Heart Evil Eye Hoops',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Hoops & Huggies'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'evil-eye', 'hoops', 'gold', 'prao-collection'],
        description: 'Waterproof 18k gold plated stainless steel hoops featuring a protective enamel evil eye heart charm. Guaranteed anti-tarnish and hypoallergenic.',
        images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-6103DR', price: 1299, compareAtPrice: 1999, stock: 40, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Crystal Leaf Ear Climbers',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Minimalist Studs'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'crystal', 'ear-climbers', 'silver', 'prao-collection'],
        description: 'Dazzling marquise cubic zirconia crystal leaves designed to gently climb along your earlobe. Tarnish-free 18k white gold finish.',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-6065PR', price: 1499, compareAtPrice: 2299, stock: 35, attributes: { finish: 'Silver', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Cascading Crystal Dangles',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'dangles', 'crystal', 'gold', 'prao-collection'],
        description: 'Multi-tiered waterfall crystal dangles that catch light from every angle. Crafted with PVD gold coating for lifetime anti-tarnish protection.',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-6047PR', price: 1699, compareAtPrice: 2499, stock: 25, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Emerald Halo Studs',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Minimalist Studs'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'emerald', 'studs', 'gold', 'prao-collection'],
        description: 'Deep green cushion-cut emerald cubic zirconia encased in a sparkling halo of pave crystals. 100% waterproof and tarnish-proof.',
        images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-6055PR', price: 999, compareAtPrice: 1599, stock: 50, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Crystal Pearl Hoops',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Hoops & Huggies'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'pearl', 'hoops', 'gold', 'prao-collection'],
        description: 'Lustrous freshwater pearls accenting high-shine gold hoop earrings. Sweat-proof, waterproof, and everyday wearable.',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-6038PR', price: 1399, compareAtPrice: 1999, stock: 30, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Peacock Pearl Jhumkas',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Jhumkas & Chaandbalis'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'jhumka', 'peacock', 'gold', 'prao-collection'],
        description: 'Intricately carved peacock motif traditional jhumki earrings with delicate seed pearl droplets. Premium anti-tarnish gold finish.',
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-5563MR', price: 1899, compareAtPrice: 2799, stock: 20, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Oxidized Handpainted Chaandbali',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Jhumkas & Chaandbalis'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'chaandbali', 'oxidized', 'silver', 'prao-collection'],
        description: 'Royal crescent chaandbali earrings handpainted with vibrant floral enamel motifs on oxidized anti-tarnish silver.',
        images: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-6037MR', price: 1799, compareAtPrice: 2599, stock: 15, attributes: { finish: 'Oxidised Silver', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Kashmiri Kundan Dangles',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'kundan', 'dangles', 'gold', 'prao-collection'],
        description: 'Traditional Kashmiri Kundan multi-stone chandelier earrings set in anti-tarnish gold frame with pastel enamel beads.',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-5611MR', price: 2199, compareAtPrice: 3299, stock: 18, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Purple Butterfly Drops',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'butterfly', 'drops', 'rose-gold', 'prao-collection'],
        description: 'Whimsical butterfly drop earrings featuring iridescent purple crystal wings on 18k rose gold anti-tarnish chain.',
        images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-5084MR', price: 1199, compareAtPrice: 1799, stock: 35, attributes: { finish: 'Rose Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      },
      {
        name: 'PRAO Anti-Tarnish Open Heart Studs',
        category: catMap['Anti-Tarnish Earrings'] || catMap['Minimalist Studs'] || catMap['Luxury Earrings'],
        brand: 'PRAO Paris',
        type: 'jewellery',
        tags: ['anti-tarnish', 'waterproof', 'heart', 'studs', 'gold', 'prao-collection'],
        description: 'Minimalist open heart stud earrings in high-polish 18k gold plated anti-tarnish stainless steel. Perfect for daily wear.',
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'PRAO-ER-5920MR', price: 799, compareAtPrice: 1299, stock: 60, attributes: { finish: 'Gold', antiTarnish: 'Yes' }, isActive: true }
        ]
      }
    ];

    // --- COSMETICS PRODUCTS (15 Items) ---
    const cosProducts = [
      {
        name: 'Velvet Crimson Matte Lipstick',
        category: catMap['Matte Lipsticks'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'A highly pigmented, non-drying matte lipstick that provides a luxurious velvet texture and lasts up to 12 hours.',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-LP-001', price: 1800, compareAtPrice: 2200, stock: 50, attributes: { shade: 'Crimson Red' }, isActive: true },
          { sku: 'SNB-COS-LP-002', price: 1800, compareAtPrice: 2200, stock: 45, attributes: { shade: 'Classic Ruby' }, isActive: true }
        ]
      },
      {
        name: 'Flawless Dewy Skin Foundation',
        category: catMap['Liquid Foundations'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'A lightweight liquid foundation that provides buildable medium-to-full coverage with a natural, hydrated glow.',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-FD-001', price: 2900, compareAtPrice: 3500, stock: 30, attributes: { shade: 'Fair Ivory' }, isActive: true },
          { sku: 'SNB-COS-FD-002', price: 2900, compareAtPrice: 3500, stock: 35, attributes: { shade: 'Warm Sand' }, isActive: true }
        ]
      },
      {
        name: 'Dermal Hydration Barrier Cream',
        category: catMap['Natural Skin Creams'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'Infused with double ceramides and hyaluronic acid to instantly calm skin irritation and lock in hydration for 48 hours.',
        images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-CR-001', price: 2450, compareAtPrice: 3000, stock: 40, attributes: { volume: '50ml' }, isActive: true }
        ]
      },
      {
        name: 'Gilded Bronze Eyeshadow Palette',
        category: catMap['Eye Shadow Palettes'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'A curated 9-shade palette featuring creamy mattes and high-foil metallic shimmers in rich warm bronze tones.',
        images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-ES-001', price: 3400, compareAtPrice: 4000, stock: 25, attributes: { palette: 'Sunset Gold' }, isActive: true }
        ]
      },
      {
        name: 'Satin Plump Lip Gloss',
        category: catMap['Matte Lipsticks'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'An advanced lip-plumping gloss containing active peptides for instant volume and high-shine crystalline finish.',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-LP-003', price: 1450, compareAtPrice: 1800, stock: 60, attributes: { shade: 'Pink Glaze' }, isActive: true }
        ]
      },
      {
        name: 'Brightening Vitamin C Gel',
        category: catMap['Natural Skin Creams'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'Formulated with Kakadu Plum extracts and 10% pure Vitamin C to reduce hyperpigmentation and reveal radiant skin.',
        images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-CR-002', price: 1950, compareAtPrice: 2400, stock: 35, attributes: { volume: '30ml' }, isActive: true }
        ]
      },
      {
        name: 'Matte Clay Pore Purifying Mask',
        category: catMap['Natural Skin Creams'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'Kaolin and Bentonite clay mask blended with tea tree oil to extract deep impurities and control excess oil production.',
        images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-CR-003', price: 1600, compareAtPrice: 2000, stock: 30, attributes: { volume: '100g' }, isActive: true }
        ]
      },
      {
        name: 'Mineral Tinted Sunscreen SPF 50',
        category: catMap['Liquid Foundations'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'Broad-spectrum zinc oxide sunscreen that leaves zero white cast while giving a light skin-blurring tint.',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-FD-003', price: 2100, compareAtPrice: 2600, stock: 40, attributes: { volume: '50ml' }, isActive: true }
        ]
      },
      {
        name: 'Nude Harmony Lip Liner',
        category: catMap['Matte Lipsticks'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'An ultra-smooth wooden lip pencil designed to outline, define, and prevent lip colors from feathering.',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-LP-004', price: 950, compareAtPrice: 1200, stock: 70, attributes: { shade: 'Dusty Rose' }, isActive: true }
        ]
      },
      {
        name: 'Precision Waterproof Eyeliner',
        category: catMap['Eye Shadow Palettes'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'A calligraphy-tip liquid eyeliner in deep carbon black. Smudge-proof and sweat-proof for 24 hours.',
        images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-ES-002', price: 1100, compareAtPrice: 1400, stock: 55, attributes: { shade: 'Carbon Black' }, isActive: true }
        ]
      },
      {
        name: 'Nourishing Rosehip Night Oil',
        category: catMap['Natural Skin Creams'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: '100% organic cold-pressed rosehip seed oil rich in fatty acids and Vitamin A to rejuvenate skin cells overnight.',
        images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-CR-004', price: 2700, compareAtPrice: 3200, stock: 22, attributes: { volume: '30ml' }, isActive: true }
        ]
      },
      {
        name: 'Volume Boost Volumizing Mascara',
        category: catMap['Eye Shadow Palettes'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'Specially designed hourglass brush coats every lash, delivering dramatic length and panoramic volume without clumping.',
        images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-ES-003', price: 1650, compareAtPrice: 2000, stock: 50, attributes: { shade: 'Midnight Black' }, isActive: true }
        ]
      },
      {
        name: 'Luminous Powder Highlighter',
        category: catMap['Liquid Foundations'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'A micro-milled powder highlighter that diffuses light, creating a seamless, wet-looking skin glow.',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-FD-004', price: 2200, compareAtPrice: 2700, stock: 35, attributes: { shade: 'Champagne Gold' }, isActive: true }
        ]
      },
      {
        name: 'Peachy Dew Liquid Blush',
        category: catMap['Liquid Foundations'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'A featherlight liquid gel blush that blends effortlessly on skin, leaving a natural flush of colour.',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-FD-005', price: 1750, compareAtPrice: 2100, stock: 40, attributes: { shade: 'Soft Coral' }, isActive: true }
        ]
      },
      {
        name: 'Rosewater Soothing Face Mist',
        category: catMap['Natural Skin Creams'],
        brand: 'SANAB Beauty',
        type: 'cosmetics',
        description: 'Distilled organic Bulgarian roses blended with aloe vera extracts to refresh skin and lock in moisture.',
        images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop'],
        variants: [
          { sku: 'SNB-COS-CR-005', price: 850, compareAtPrice: 1100, stock: 80, attributes: { volume: '120ml' }, isActive: true }
        ]
      }
    ];

    productsData.push(...jwlProducts, ...cosProducts);
    const seededProducts = await Product.create(productsData);
    console.log(`✅ Seeded ${seededProducts.length} premium demo products (15 Jewellery & 15 Cosmetics).`);
  } catch (error) {
    console.error('❌ Failed to seed products and categories:', (error as Error).message);
  }
};

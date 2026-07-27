import { connectDatabase, disconnectDatabase } from '../database/index.js';
import { Brand } from '../modules/brands/models/brand.model.js';
import { Category } from '../modules/categories/models/category.model.js';
import { Product } from '../modules/products/models/product.model.js';
import { logger } from '../utils/logger.js';

/**
 * Seeds demo catalog data so retailer Home/Brands/Products screens have content.
 * Safe to re-run — upserts by slug / SKU.
 */
const seedCatalog = async (): Promise<void> => {
  await connectDatabase();

  const brands = [
    {
      name: 'Amul',
      slug: 'amul',
      description: 'Dairy and beverages',
      logo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Britannia',
      slug: 'britannia',
      description: 'Biscuits and bakery',
      logo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'ITC',
      slug: 'itc',
      description: 'FMCG staples and snacks',
      logo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 3,
      isActive: true,
    },
  ];

  const categories = [
    {
      name: 'Dairy',
      slug: 'dairy',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Biscuits',
      slug: 'biscuits',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Snacks',
      slug: 'snacks',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      displayOrder: 4,
      isActive: true,
    },
  ];

  const brandDocs = [];
  for (const brand of brands) {
    const doc = await Brand.findOneAndUpdate(
      { slug: brand.slug },
      { $set: brand },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    brandDocs.push(doc!);
    logger.info(`Seeded brand: ${brand.name}`);
  }

  const categoryDocs = [];
  for (const category of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: category.slug },
      { $set: category },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    categoryDocs.push(doc!);
    logger.info(`Seeded category: ${category.name}`);
  }

  const amul = brandDocs.find((b) => b.slug === 'amul')!;
  const britannia = brandDocs.find((b) => b.slug === 'britannia')!;
  const itc = brandDocs.find((b) => b.slug === 'itc')!;
  const dairy = categoryDocs.find((c) => c.slug === 'dairy')!;
  const biscuits = categoryDocs.find((c) => c.slug === 'biscuits')!;
  const snacks = categoryDocs.find((c) => c.slug === 'snacks')!;
  const beverages = categoryDocs.find((c) => c.slug === 'beverages')!;

  const products = [
    {
      productName: 'Amul Taaza Toned Milk 1L',
      slug: 'amul-taaza-toned-milk-1l',
      brandId: amul._id,
      categoryId: dairy._id,
      description: 'Fresh toned milk, chilled distribution recommended.',
      sku: 'AML-MLK-1L',
      barcode: '8901262010012',
      weight: 1,
      unit: 'ltr' as const,
      mrp: 68,
      sellingPrice: 64,
      offerPrice: 62,
      gst: 5,
      stock: 240,
      minimumOrderQuantity: 12,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      tags: ['milk', 'dairy'],
      isFeatured: true,
      isBestSeller: true,
      isAvailable: true,
      isActive: true,
    },
    {
      productName: 'Amul Butter 500g',
      slug: 'amul-butter-500g',
      brandId: amul._id,
      categoryId: dairy._id,
      description: 'Salted butter for retail shelves.',
      sku: 'AML-BTR-500',
      weight: 500,
      unit: 'g' as const,
      mrp: 285,
      sellingPrice: 270,
      gst: 12,
      stock: 80,
      minimumOrderQuantity: 6,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      tags: ['butter', 'dairy'],
      isFeatured: true,
      isBestSeller: false,
      isAvailable: true,
      isActive: true,
    },
    {
      productName: 'Britannia Good Day Cashew 200g',
      slug: 'britannia-good-day-cashew-200g',
      brandId: britannia._id,
      categoryId: biscuits._id,
      description: 'Cashew cookies, high-velocity biscuit SKU.',
      sku: 'BRT-GDY-200',
      weight: 200,
      unit: 'g' as const,
      mrp: 40,
      sellingPrice: 36,
      offerPrice: 34,
      gst: 18,
      stock: 500,
      minimumOrderQuantity: 24,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      tags: ['biscuit', 'cookies'],
      isFeatured: false,
      isBestSeller: true,
      isAvailable: true,
      isActive: true,
    },
    {
      productName: 'ITC Bingo Mad Angles 90g',
      slug: 'itc-bingo-mad-angles-90g',
      brandId: itc._id,
      categoryId: snacks._id,
      description: 'Triangle chips — assorted flavours.',
      sku: 'ITC-BNG-90',
      weight: 90,
      unit: 'g' as const,
      mrp: 20,
      sellingPrice: 18,
      gst: 18,
      stock: 320,
      minimumOrderQuantity: 48,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      tags: ['snacks', 'chips'],
      isFeatured: true,
      isBestSeller: true,
      isAvailable: true,
      isActive: true,
    },
    {
      productName: 'Amul Cool Cafe 200ml',
      slug: 'amul-cool-cafe-200ml',
      brandId: amul._id,
      categoryId: beverages._id,
      description: 'Ready-to-drink coffee beverage.',
      sku: 'AML-CFE-200',
      weight: 200,
      unit: 'ml' as const,
      mrp: 25,
      sellingPrice: 22,
      gst: 12,
      stock: 150,
      minimumOrderQuantity: 24,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      tags: ['beverage', 'coffee'],
      isFeatured: false,
      isBestSeller: false,
      isAvailable: true,
      isActive: true,
    },
    {
      productName: 'Britannia Marie Gold 250g',
      slug: 'britannia-marie-gold-250g',
      brandId: britannia._id,
      categoryId: biscuits._id,
      description: 'Classic marie biscuits.',
      sku: 'BRT-MRG-250',
      weight: 250,
      unit: 'g' as const,
      mrp: 35,
      sellingPrice: 32,
      gst: 18,
      stock: 0,
      minimumOrderQuantity: 24,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      tags: ['biscuit'],
      isFeatured: false,
      isBestSeller: false,
      isAvailable: false,
      isActive: true,
    },
  ];

  for (const product of products) {
    await Product.findOneAndUpdate(
      { sku: product.sku },
      { $set: product },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    logger.info(`Seeded product: ${product.productName}`);
  }

  // eslint-disable-next-line no-console
  console.log(`
Catalog seed complete.
  Brands     → ${brands.length}
  Categories → ${categories.length}
  Products   → ${products.length}
`);

  await disconnectDatabase();
};

seedCatalog().catch(async (error) => {
  logger.error('Catalog seed failed', error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});

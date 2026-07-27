import { connectDatabase, disconnectDatabase } from '../database/index.js';
import { User } from '../modules/users/models/user.model.js';
import { ROLES } from '../constants/roles.constant.js';
import { logger } from '../utils/logger.js';

/**
 * Seeds demo Admin + Retailer accounts so OTP login can be tested immediately.
 * Safe to re-run — upserts by mobile.
 */
const seedUsers = async (): Promise<void> => {
  await connectDatabase();

  const seeds = [
    {
      fullName: 'Goyal Admin',
      mobile: '9999999999',
      email: 'admin@goyaltraders.com',
      role: ROLES.ADMIN,
      isVerified: true,
      isActive: true,
    },
    {
      fullName: 'Demo Retailer',
      mobile: '9888888888',
      email: 'retailer@goyaltraders.com',
      role: ROLES.RETAILER,
      shopName: 'Demo Kirana Store',
      gstNumber: '27AAPFU0939F1ZV',
      address: {
        line1: '12 Market Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
      },
      isVerified: true,
      isActive: true,
    },
  ];

  for (const seed of seeds) {
    await User.findOneAndUpdate(
      { mobile: seed.mobile },
      { $set: seed },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    logger.info(`Seeded ${seed.role}: ${seed.mobile} (${seed.fullName})`);
  }

  // eslint-disable-next-line no-console
  console.log(`
Seed complete.
  Admin    → mobile 9999999999
  Retailer → mobile 9888888888

Use POST /api/v1/auth/send-otp then check the server console for the OTP.
`);

  await disconnectDatabase();
};

seedUsers().catch(async (error) => {
  logger.error('Seed failed', error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

const seedAdmin = async () => {
  const name = process.env.SEED_ADMIN_NAME || 'System Administrator';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@warehouse.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'Admin';
    existing.isActive = true;
    await existing.save();
    console.log('User ' + email + ' promoted to Admin.');
  } else {
    await User.create({ name, email, password, role: 'Admin' });
    console.log('Admin user created: ' + email);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
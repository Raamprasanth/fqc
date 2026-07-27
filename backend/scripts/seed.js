// ─────────────────────────────────────────────────────────────────────────────
// backend/scripts/seed.js
// One-time script to populate MongoDB Atlas with initial users.
// Run with:  node scripts/seed.js
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User      = require('../models/User');

const SEED_USERS = [
  { username: 'admin',     password: 'admin123', role: 'admin',    name: 'Admin User',  email: 'admin@schillerindia.com' },
  { username: 'employee1', password: 'emp123',   role: 'employee', name: 'John Doe',    email: 'john.doe@schillerindia.com' },
];

async function seed() {
  await connectDB();

  console.log('\n🌱  Seeding users into MongoDB Atlas...\n');

  for (const u of SEED_USERS) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      console.log(`  ⏩  Skipping "${u.username}" — already exists.`);
      continue;
    }

    const passwordHash = await User.hashPassword(u.password);
    await User.create({
      username: u.username,
      passwordHash,
      role: u.role,
      name: u.name,
      email: u.email,
    });
    console.log(`  ✅  Created ${u.role}: "${u.username}" (password: ${u.password})`);
  }

  console.log('\n✨  Seeding complete!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

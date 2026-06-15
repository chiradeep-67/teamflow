/**
 * Development only — wipes the entire database.
 * Usage: node scripts/reset-db.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
  console.log('✅ Database cleared. You can now register fresh as Owner.');
  process.exit(0);
}

reset().catch(err => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});

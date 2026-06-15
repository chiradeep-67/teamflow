/**
 * Run this once to promote a user to Owner by email.
 * Usage: node scripts/make-owner.js your@email.com
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

const email = process.argv[2];
if (!email) { console.error('Usage: node scripts/make-owner.js your@email.com'); process.exit(1); }

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { systemRole: 'owner' },
      { new: true }
    );
    if (!user) { console.error(`❌ No user found with email: ${email}`); }
    else { console.log(`✅ ${user.name} (${user.email}) is now Owner`); }
    process.exit(0);
  })
  .catch(err => { console.error('❌ DB error:', err.message); process.exit(1); });

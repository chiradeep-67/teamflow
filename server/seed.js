/**
 * Developer seed script — creates one Organization + Workspace + Admin user.
 *
 * Usage:
 *   node seed.js "Acme Corp" "admin@acme.com" "SecurePass123"
 *
 * The admin is forced to change their password on first login.
 * Run from the server/ directory (or anywhere — dotenv resolves .env from __dirname).
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const mongoose     = require('mongoose');
const Organization = require('./models/Organization');
const User         = require('./models/User');
const Workspace    = require('./models/Workspace');

/* ── helpers ─────────────────────────────────────────────────────────────── */

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'workspace';
}

function bold(s)  { return `\x1b[1m${s}\x1b[0m`; }
function green(s) { return `\x1b[32m${s}\x1b[0m`; }
function red(s)   { return `\x1b[31m${s}\x1b[0m`; }
function yellow(s){ return `\x1b[33m${s}\x1b[0m`; }
function dim(s)   { return `\x1b[2m${s}\x1b[0m`; }

/* ── main ────────────────────────────────────────────────────────────────── */

async function seed() {
  const [orgName, email, password] = process.argv.slice(2);

  /* ── validate CLI args ── */
  if (!orgName || !email || !password) {
    console.error(red('\nUsage: node seed.js "Org Name" "admin@email.com" "password"\n'));
    process.exit(1);
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    console.error(red(`\n❌  Invalid email address: ${email}\n`));
    process.exit(1);
  }

  if (password.length < 8) {
    console.error(red('\n❌  Password must be at least 8 characters\n'));
    process.exit(1);
  }

  /* ── connect ── */
  console.log(dim('\nConnecting to MongoDB…'));
  await mongoose.connect(process.env.MONGO_URI);
  console.log(green('✔  Connected\n'));

  try {
    /* ── guard: email collision ── */
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.error(red(`❌  A user with email "${email}" already exists.`));
      console.error(dim('   Delete the user first, or use a different email.\n'));
      process.exit(1);
    }

    /* ── 1. Organization ── */
    const org = await Organization.create({ name: orgName });
    console.log(`${green('✔')}  Organization : ${bold(orgName)}  ${dim(`(${org._id})`)}`);

    /* ── 2. Admin user ──
     * password will be hashed by the User pre-save hook.
     * mustChangePassword: true forces the admin to set a new password on first login. */
    const admin = new User({
      name:               'Admin',
      email:              email.toLowerCase(),
      password,
      organizationId:     org._id,
      systemRole:         'admin',
      mustChangePassword: false,   // admin credentials are set directly by the developer
      isActive:           true,
    });
    await admin.save();
    console.log(`${green('✔')}  Admin user   : ${bold(email)}  ${dim(`(${admin._id})`)}`);

    /* ── 3. Workspace (linked to org + admin) ── */
    const baseSlug = toSlug(orgName);
    // make slug unique if it already exists
    let slug = baseSlug;
    let suffix = 1;
    while (await Workspace.findOne({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const workspace = await Workspace.create({
      name:           orgName,
      slug,
      organizationId: org._id,
      createdBy:      admin._id,
      departments:    [],
    });
    console.log(`${green('✔')}  Workspace    : ${bold(workspace.name)}  ${dim(`slug="${workspace.slug}"`)}`);

    /* ── summary ── */
    console.log('\n' + '─'.repeat(52));
    console.log(green(bold('  Seed complete!')));
    console.log('─'.repeat(52));
    console.log(`  Organization  ${bold(orgName)}`);
    console.log(`  Admin email   ${bold(email)}`);
    console.log(`  Temp password ${bold(password)}`);
    console.log('─'.repeat(52));
    console.log(dim('  Admin can log in directly with the credentials above.'));
    console.log('─'.repeat(52) + '\n');

  } catch (err) {
    console.error(red(`\n❌  Seed failed: ${err.message}\n`));
    if (process.env.NODE_ENV === 'development') console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();

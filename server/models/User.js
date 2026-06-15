const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, select: false },

  // Global system role — assigned by Admin
  systemRole: {
    type: String,
    enum: ['admin', 'project_manager', 'team_lead', 'member', 'client'],
    default: 'member',
  },

  department: { type: String, default: '' },
  title:      { type: String, default: '' },
  bio:        { type: String, default: '' },
  avatar:     { type: String, default: '' },   // initials or URL
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

/* Hash password before save */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* Compare password */
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);

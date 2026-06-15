const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },

  // admin | project_manager | team_lead | member
  systemRole: {
    type: String,
    enum: ['admin', 'project_manager', 'team_lead', 'member'],
    default: 'member',
  },

  // Forces a password change on next login (set true when admin seeds or creates a user)
  mustChangePassword: { type: Boolean, default: false },

  department: { type: String, default: '' },
  title:      { type: String, default: '' },
  bio:        { type: String, default: '' },
  avatar:     { type: String, default: '' },
  phone:      { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);

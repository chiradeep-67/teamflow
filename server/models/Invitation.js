const mongoose = require('mongoose');
const crypto   = require('crypto');

const InvitationSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },

  // Admins are seeded — only these three roles can be invited
  systemRole: {
    type: String,
    enum: ['project_manager', 'team_lead', 'member'],
    default: 'member',
  },

  department: { type: String, default: '' },
  token:      { type: String, required: true, unique: true },
  invitedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },

  accepted:  { type: Boolean, default: false },
  // 24-hour expiry per spec
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

InvitationSchema.statics.generateToken = () => crypto.randomBytes(32).toString('hex');

module.exports = mongoose.model('Invitation', InvitationSchema);

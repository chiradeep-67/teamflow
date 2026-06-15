const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  industry:    { type: String, default: '' },
  size:        { type: String, default: '' },
  logo:        { type: String, default: '' },
  departments: [{ type: String, trim: true }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Every workspace belongs to one organization (one-to-one)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);

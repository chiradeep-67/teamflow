const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,   // optional for backward-compat with pre-multitenancy data
  },

  status:   { type: String, enum: ['todo', 'in_progress', 'in_review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
  tags:     [{ type: String }],

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  dueDate:  { type: Date },
  comments: [CommentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);

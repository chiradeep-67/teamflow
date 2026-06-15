const mongoose = require('mongoose');

const ProjectMemberSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectRole: {
    type: String,
    enum: ['project_manager', 'team_lead', 'member'],
    default: 'member',
  },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color:       { type: String, default: '#6366f1' },
  status:      { type: String, enum: ['active', 'paused', 'completed', 'archived'], default: 'active' },
  tags:        [{ type: String }],
  startDate:   { type: Date },
  dueDate:     { type: Date },

  members:    [ProjectMemberSchema],
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

ProjectSchema.virtual('taskCount', {
  ref:          'Task',
  localField:   '_id',
  foreignField: 'project',
  count:        true,
});

module.exports = mongoose.model('Project', ProjectSchema);

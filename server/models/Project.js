const mongoose = require('mongoose');

/**
 * ProjectMember — stores a user's role WITHIN this specific project.
 * A user can be 'team_lead' in Project A and 'member' in Project B.
 */
const ProjectMemberSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectRole: {
    type: String,
    enum: ['project_manager', 'team_lead', 'member', 'client'],
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

  // Members with their project-level roles
  members:     [ProjectMemberSchema],

  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

/* Virtual: task count (populated externally) */
ProjectSchema.virtual('taskCount', {
  ref:          'Task',
  localField:   '_id',
  foreignField: 'project',
  count:        true,
});

module.exports = mongoose.model('Project', ProjectSchema);

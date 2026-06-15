const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// Pre-load models so Mongoose registers them before any route handler fires
require('./models/Organization');
require('./models/User');
require('./models/Workspace');
require('./models/Project');
require('./models/Task');
require('./models/Invitation');

const app = express();

/* ─── Middleware ─── */
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

/* ─── Routes ─── */
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));
app.use('/api/projects',  require('./routes/projectRoutes')); /* tasks nested inside: /api/projects/:id/tasks */
app.use('/api/workspace', require('./routes/workspaceRoutes'));
app.use('/api/invites',   require('./routes/inviteRoutes'));

/* ─── Health check ─── */
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'TeamFlow API' }));

/* ─── Error handler ─── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 TeamFlow API running on port ${PORT}`));

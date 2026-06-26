const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();

// Pre-load models so Mongoose registers them before any route handler fires
require('./models/Organization');
require('./models/User');
require('./models/Workspace');
require('./models/Project');
require('./models/Task');
require('./models/Invitation');

const app = express();

/* ─── Security ─── */
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again in 15 minutes.' },
});

/* ─── Middleware ─── */
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (origin === process.env.CLIENT_URL) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.vercel.app')) return true;
  } catch { /* invalid origin */ }
  return false;
};

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) cb(null, true);
    else cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

/* ─── Routes ─── */
app.use('/api/auth',      authLimiter, require('./routes/authRoutes'));
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

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 TeamFlow API running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  });

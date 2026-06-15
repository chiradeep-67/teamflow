const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/checkRole');

router.use(protect);

// GET /api/users — Admin sees all; PM sees all; others see only themselves
router.get('/', async (req, res) => {
  try {
    const canSeeAll = ['admin', 'project_manager'].includes(req.user.systemRole);
    const users = canSeeAll
      ? await User.find({ isActive: true }).select('-password')
      : [req.user];
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  if (req.params.id !== req.user._id.toString() && req.user.systemRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.json({ success: true, user: req.user });
});

// PUT /api/users/:id — own profile or admin
router.put('/:id', async (req, res) => {
  const isSelf  = req.params.id === req.user._id.toString();
  const isAdmin = req.user.systemRole === 'admin';
  if (!isSelf && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/role — Admin only
router.put('/:id/role', requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { systemRole: req.body.systemRole }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

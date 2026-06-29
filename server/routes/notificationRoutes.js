const express      = require('express');
const router       = express.Router();
const { protect }  = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(protect);

/* ── GET /api/notifications — fetch latest 30 for current user ── */
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient:      req.user._id,
      organizationId: req.user.organizationId,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient:      req.user._id,
      organizationId: req.user.organizationId,
      read:           false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PATCH /api/notifications/:id/read — mark one as read ── */
router.patch('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PATCH /api/notifications/read-all — mark all as read ── */
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, organizationId: req.user.organizationId, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  getMe,
  getSetupStatus,
  changePassword,
  createOrg,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.get('/setup',            getSetupStatus);
router.post('/register',        register);          // invite-token required
router.post('/login',           login);
router.post('/create-org',      createOrg);         // public — creates a new org + admin
router.get('/me',               protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;

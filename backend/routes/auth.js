// ─────────────────────────────────────────────────────────────────────────────
// backend/routes/auth.js
// POST /api/auth/login   — authenticate and return a JWT
// GET  /api/auth/me      — return the current user's profile (protected)
// POST /api/auth/logout  — client-side; endpoint exists for completeness
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // ── Basic validation ──────────────────────────────────────────────────────
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and role are required.',
      });
    }

    const allowedRoles = ['admin', 'employee'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "admin" or "employee".',
      });
    }

    // ── Look up user in MongoDB ───────────────────────────────────────────────
    const user = await User.findOne({ username: { $regex: new RegExp('^' + username.trim() + '$', 'i') } });
    console.log('Login attempt:', username, 'User found:', !!user);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // ── Check account is active ───────────────────────────────────────────────
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled. Contact admin.' });
    }

    // ── Verify password ───────────────────────────────────────────────────────
    const passwordOk = await user.verifyPassword(password);
    console.log('Password OK:', passwordOk);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    // ── Role check ────────────────────────────────────────────────────────────
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account does not have ${role} access.`,
      });
    }

    // ── Sign JWT ──────────────────────────────────────────────────────────────
    const payload = {
      id:       user._id,
      username: user.username,
      role:     user.role,
      name:     user.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ── GET /api/auth/me (protected) ─────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// JWT is stateless; the client simply discards the token.
router.post('/logout', authenticateToken, (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;

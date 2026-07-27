// ─────────────────────────────────────────────────────────────────────────────
// backend/routes/users.js
// User Management API
// All routes here should be protected and restricted to "admin" role
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin role requirement to all routes in this file
router.use(authenticateToken);
router.use(requireRole('admin'));

// ── GET /api/users ────────────────────────────────────────────────────────────
// Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, users: users.map(u => u.toSafeObject()) });
  } catch (err) {
    console.error('[Get Users Error]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// ── POST /api/users ───────────────────────────────────────────────────────────
// Create a new user
router.post('/', async (req, res) => {
  try {
    let { username, password, role, name, email, adminId, employeeId, repairTeamId, userId, department, designation, divisions, division } = req.body;

    // Frontend compatibility: Map various IDs to username
    if (!username) {
      username = adminId || employeeId || repairTeamId || userId;
    }

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username (or ID), password, and name are required.' });
    }

    const existingUser = await User.findOne({ username: { $regex: new RegExp('^' + username.trim() + '$', 'i') } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      username,
      passwordHash,
      role: role || 'employee',
      name,
      email,
      department,
      designation,
      divisions: divisions || (division ? [division] : [])
    });

    res.status(201).json({ success: true, message: 'User created successfully.', user: newUser.toSafeObject() });
  } catch (err) {
    console.error('[Create User Error]', err);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
// Update an existing user
router.put('/:id', async (req, res) => {
  try {
    const { username, role, name, email, isActive, password } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update fields
    if (username) user.username = username;
    if (role) user.role = role;
    if (name) user.name = name;
    if (email !== undefined) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Update password if provided
    if (password) {
      user.passwordHash = await User.hashPassword(password);
    }

    await user.save();
    res.json({ success: true, message: 'User updated successfully.', user: user.toSafeObject() });
  } catch (err) {
    console.error('[Update User Error]', err);
    // Handle duplicate username error
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[Delete User Error]', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;

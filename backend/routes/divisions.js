const express = require('express');
const Division = require('../models/Division');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ── GET /api/divisions ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const divisions = await Division.find().sort({ name: 1 });
    res.json(divisions);
  } catch (err) {
    console.error('[Get Divisions Error]', err);
    res.status(500).json({ message: 'Failed to fetch divisions.' });
  }
});

// Admin-only routes
router.use(requireRole('admin'));

// ── POST /api/divisions ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, displayName, models } = req.body;
    if (!name) return res.status(400).json({ message: 'Division name is required' });

    const newDivision = await Division.create({ name, displayName, models });
    res.status(201).json(newDivision);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Division name already exists.' });
    }
    console.error('[Create Division Error]', err);
    res.status(500).json({ message: 'Failed to create division.' });
  }
});

// ── PUT /api/divisions/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, displayName, models } = req.body;
    const division = await Division.findByIdAndUpdate(
      req.params.id,
      { name, displayName, models },
      { new: true, runValidators: true }
    );
    if (!division) return res.status(404).json({ message: 'Division not found.' });
    res.json(division);
  } catch (err) {
    console.error('[Update Division Error]', err);
    res.status(500).json({ message: 'Failed to update division.' });
  }
});

// ── DELETE /api/divisions/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const division = await Division.findByIdAndDelete(req.params.id);
    if (!division) return res.status(404).json({ message: 'Division not found.' });
    res.json({ success: true, message: 'Division deleted' });
  } catch (err) {
    console.error('[Delete Division Error]', err);
    res.status(500).json({ message: 'Failed to delete division.' });
  }
});

module.exports = router;

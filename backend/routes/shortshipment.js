const express = require('express');
const Shortshipment = require('../models/Shortshipment');

const router = express.Router();

// ── GET / ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Shortshipment.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Shortshipment Error]', err);
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// ── POST / ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;

    if (Array.isArray(req.body)) {
      if (!req.body.length) return res.status(400).json({ message: 'Empty payload.' });
      const dataList = req.body.map(item => userId ? { ...item, createdBy: userId } : item);
      const inserted = await Shortshipment.insertMany(dataList);
      return res.status(201).json(inserted);
    }

    const data = userId ? { ...req.body, createdBy: userId } : req.body;
    const newRecord = await Shortshipment.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Shortshipment Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});

// ── PUT /:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const updated = await Shortshipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Record not found.' });
    res.json(updated);
  } catch (err) {
    console.error('[Update Shortshipment Error]', err);
    res.status(500).json({ message: 'Failed to update record.', error: err.message });
  }
});

// ── DELETE /:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Shortshipment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Record deleted successfully.', deleted });
  } catch (err) {
    console.error('[Delete Shortshipment Error]', err);
    res.status(500).json({ message: 'Failed to delete record.', error: err.message });
  }
});

module.exports = router;

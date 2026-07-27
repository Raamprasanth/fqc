const express = require('express');
const router = express.Router();
const DoaWf = require('../models/DoaWf');

// Get DOA+WF entries optionally filtered by division
router.get('/', async (req, res) => {
  try {
    const { division } = req.query;
    let query = {};
    if (division) query.division = division;

    const entries = await DoaWf.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new DOA+WF entry
router.post('/', async (req, res) => {
  try {
    const entry = new DoaWf(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

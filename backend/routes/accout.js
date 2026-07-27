const express = require('express');
const router = express.Router();
const AccOut = require('../models/AccOut');

// Get ACC-OUT entries optionally filtered by division
router.get('/', async (req, res) => {
  try {
    const { division } = req.query;
    let query = {};
    if (division) query.division = division;

    const entries = await AccOut.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new ACC-OUT entry
router.post('/', async (req, res) => {
  try {
    const entry = new AccOut(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

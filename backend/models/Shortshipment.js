const mongoose = require('mongoose');

const ShortshipmentSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String, required: true }, // The key used in frontend divisions config
  values: { type: Object, required: true }, // Dynamic fields payload
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shortshipment', ShortshipmentSchema, 'shortshipments');

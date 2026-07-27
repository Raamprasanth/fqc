const mongoose = require('mongoose');

const AccOutSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String, required: true },
  values: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccOut', AccOutSchema, 'accouts');

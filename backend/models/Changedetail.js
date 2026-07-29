const mongoose = require('mongoose');

const ChangedetailSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String },
  values: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Changedetail', ChangedetailSchema, 'changedetails');

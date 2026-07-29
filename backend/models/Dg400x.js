// backend/models/Dg400x.js
const mongoose = require('mongoose');

const dg400xSchema = new mongoose.Schema({
  division:               { type: String, required: true },
  month:                  { type: String, default: '—' },
  model:                  { type: String, default: '—' },
  unitSn:                 { type: String, default: '—' },
  inwardDate:             { type: String, default: '—' },
  outwardDate:            { type: String, default: '—' },
  leafSpringHeightOutward:{ type: String, default: '—' },
  // Test point row fields
  testPoint:              { type: String, default: '—' },
  impValueMin:            { type: String, default: '—' },
  impValueMax:            { type: String, default: '—' },
  testedImpInward:        { type: String, default: '—' },
  testedImpOutward:       { type: String, default: '—' },
}, { timestamps: true });

module.exports = mongoose.model('Dg400x', dg400xSchema);

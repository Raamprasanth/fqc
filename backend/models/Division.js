// ─────────────────────────────────────────────────────────────────────────────
// backend/models/Division.js
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  supplier: { type: String, default: '' },
  model: { type: String, required: true },
  desc: { type: String, default: '' }
}, { _id: false });

const divisionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, default: '' },
  models: [modelSchema]
}, { timestamps: true });

const Division = mongoose.model('Division', divisionSchema);
module.exports = Division;

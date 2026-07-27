// ─────────────────────────────────────────────────────────────────────────────
// backend/models/Outward.js
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const outwardSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String }, // 'vent-anesthesia', 'ag-monitors', or 'shipl-ganshorn'
  values: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Outward = mongoose.model('Outward', outwardSchema);
module.exports = Outward;

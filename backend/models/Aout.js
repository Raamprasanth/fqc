const mongoose = require('mongoose');

const aoutSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String }, // 'vent-anesthesia', 'ag-monitors', or 'shipl-ganshorn'
  values: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Aout = mongoose.model('Aout', aoutSchema);
module.exports = Aout;

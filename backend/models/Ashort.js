const mongoose = require('mongoose');

const ashortSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String },
  values: { type: mongoose.Schema.Types.Mixed, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Ashort = mongoose.model('Ashort', ashortSchema);
module.exports = Ashort;

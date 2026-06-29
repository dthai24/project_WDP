const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  levelName: { type: String, required: true, maxlength: 20 },
  displayName: { type: String, required: true, maxlength: 50 },
  sortOrder: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);

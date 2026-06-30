const mongoose = require('mongoose');

const pathSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  pathName: { type: String, required: true, maxlength: 100 },
  description: String,
  order: Number,
}, { timestamps: true });

module.exports = mongoose.model('Path', pathSchema);

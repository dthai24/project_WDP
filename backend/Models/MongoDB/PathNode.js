const mongoose = require('mongoose');

const pathNodeSchema = new mongoose.Schema({
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'Path', required: true },
  nodeName: { type: String, required: true, maxlength: 255 },
  nodeOrder: { type: Number, required: true },
  description: String,
  isFree: { type: Boolean, default: false },
});

module.exports = mongoose.model('PathNode', pathNodeSchema);

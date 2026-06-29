const mongoose = require('mongoose');

const pathNodeSchema = new mongoose.Schema({
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'Path', required: true },
  nodeName: { type: String, required: true, maxlength: 255 },
  nodeOrder: { type: Number, required: true },
  description: String,
});

module.exports = mongoose.model('PathNode', pathNodeSchema);

const mongoose = require('mongoose');

const nodeMaterialSchema = new mongoose.Schema({
  nodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PathNode', required: true },
  materialType: { type: String, required: true, maxlength: 20 }, // VIDEO, DOC, AUDIO, TEXT
  title: { type: String, required: true, maxlength: 255 },
  materialUrl: String,
  materialOrder: { type: Number, required: true },
  sourceType: { type: String, maxlength: 20 }, // LINK, UPLOAD
  fileName: { type: String, maxlength: 255 },
  fileSize: Number,
  embedUrl: String,
  content: { type: String }, // HTML content for TEXT materials
});

module.exports = mongoose.models.NodeMaterial || mongoose.model('NodeMaterial', nodeMaterialSchema);

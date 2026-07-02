const mongoose = require('mongoose');

const userNodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PathNode', required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now },
});

userNodeSchema.index({ userId: 1, nodeId: 1 }, { unique: true });

module.exports = mongoose.models.UserNode || mongoose.model('UserNode', userNodeSchema);

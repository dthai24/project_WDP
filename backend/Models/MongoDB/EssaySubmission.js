const mongoose = require('mongoose');

const essaySubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  nodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PathNode', required: true },
  essayText: { type: String, required: true },
  score: { type: Number, default: 0 },
  grammarScore: { type: Number, default: 0 },
  vocabularyScore: { type: Number, default: 0 },
  coherenceScore: { type: Number, default: 0 },
  feedback: String,
}, { timestamps: true });

module.exports = mongoose.model('EssaySubmission', essaySubmissionSchema);

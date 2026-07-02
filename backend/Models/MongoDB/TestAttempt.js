const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  point: Number,
});

module.exports = mongoose.models.TestAttempt || mongoose.model('TestAttempt', testAttemptSchema);

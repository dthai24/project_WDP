const mongoose = require('mongoose');

const testQuestionCollectionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
});

module.exports = mongoose.models.TestQuestionCollection || mongoose.model('TestQuestionCollection', testQuestionCollectionSchema);

const mongoose = require('mongoose');

const testQuestionSchema = new mongoose.Schema({
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestionCollection' },
  title: String,
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionType', required: true },
  url: String,
});

module.exports = mongoose.models.TestQuestion || mongoose.model('TestQuestion', testQuestionSchema);

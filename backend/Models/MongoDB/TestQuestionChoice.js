const mongoose = require('mongoose');

const testQuestionChoiceSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestQuestion', required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  isTrue: { type: Boolean, required: true },
});

module.exports = mongoose.model('TestQuestionChoice', testQuestionChoiceSchema);

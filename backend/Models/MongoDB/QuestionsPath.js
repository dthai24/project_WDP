const mongoose = require('mongoose');

const questionsPathSchema = new mongoose.Schema({
  bankId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: 'Path', required: true },
});

module.exports = mongoose.model('QuestionsPath', questionsPathSchema);

const mongoose = require('mongoose');

const questionChoiceSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  title: { type: String, required: true, maxlength: 250 },
  order: { type: Number, required: true },
  isTrue: { type: Boolean, required: true },
});

module.exports = mongoose.model('QuestionChoice', questionChoiceSchema);

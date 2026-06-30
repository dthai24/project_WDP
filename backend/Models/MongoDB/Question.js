const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questionPathId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionsPath', required: true },
  isActive: { type: Boolean, default: true },
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionType', required: true },
  url: String,
  order: { type: Number, required: true },
});

module.exports = mongoose.model('Question', questionSchema);

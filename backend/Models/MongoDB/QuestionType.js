const mongoose = require('mongoose');

const questionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 10 },
});

module.exports = mongoose.model('QuestionType', questionTypeSchema);

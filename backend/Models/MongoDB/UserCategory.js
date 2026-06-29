const mongoose = require('mongoose');

const userCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});

userCategorySchema.index({ userId: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model('UserCategory', userCategorySchema);

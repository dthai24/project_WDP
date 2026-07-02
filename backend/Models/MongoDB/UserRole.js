const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
});

userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.models.UserRole || mongoose.model('UserRole', userRoleSchema);

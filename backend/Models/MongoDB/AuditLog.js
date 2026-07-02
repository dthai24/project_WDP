const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['Course', 'Category', 'Level', 'User'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityName: {
    type: String
  },
  action: {
    type: String,
    required: true // 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'BLOCK', 'UNBLOCK'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

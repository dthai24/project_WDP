const AuditLog = require('../models/MongoDB/AuditLog');

const logAction = async ({ entityType, entityId, entityName, action, userId, changes, description }) => {
  try {
    await AuditLog.create({
      entityType,
      entityId,
      entityName,
      action,
      userId,
      changes,
      description
    });
  } catch (err) {
    console.error('Failed to save audit log:', err.message);
  }
};

module.exports = { logAction };

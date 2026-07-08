const Notification = require('../Models/MongoDB/Notification');

async function createNotification({ userId, type = 'system', title, message, link, metadata }) {
  return Notification.create({ userId, type, title, message, link, metadata });
}

module.exports = { createNotification };

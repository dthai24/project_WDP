const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 255 },
});

module.exports = mongoose.model('Role', roleSchema);

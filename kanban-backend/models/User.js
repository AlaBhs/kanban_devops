const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'worker'], default: 'worker' },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () { return this.role === 'worker'; } // only for workers
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['member', 'admin'], 
    default: 'member' 
  },
  interests: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
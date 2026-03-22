const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  role: { 
    type: String, 
    enum: ['member', 'admin'], 
    default: 'member' 
  },
  isVerified: { type: Boolean, default: false },


  year: { type: String },         
  major: { type: String },         
  bio: { type: String, default: "" },
  interests: { type: [String], default: [] }, 
  profilePicture: { type: String, default: "" }, 
  
  resetPasswordToken: String,
  resetPasswordExpire: Date
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
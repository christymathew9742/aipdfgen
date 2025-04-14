const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  confirmPassword: { type: String,required: true},
  profileImage: { type: String },
  additionalInfo: { type: String }
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (this.password !== this.confirmPassword) {
    return next(new Error('Passwords do not match'));
  }

  this.password = bcrypt.hashSync(this.password, 10);
  this.confirmPassword = undefined;
  next();
});

module.exports = mongoose.model('User', userSchema);


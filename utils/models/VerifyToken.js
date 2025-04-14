const mongoose = require('mongoose');

const VerifyTokenSchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    verifyToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

VerifyTokenSchema.index({ verifyToken: 1 });

const VerifyToken = mongoose.model('VerifyToken', VerifyTokenSchema);
module.exports = VerifyToken;

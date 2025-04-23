const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: [true, 'prompt is required'],
    trim: true,
  },
  uploadedFileId: {
    type: String,
    required: [true, 'uploadedFileId is required'],
  },
}, { 
  timestamps: true
});

const ChatBot = mongoose.model('ChatBot', chatbotSchema);

module.exports = ChatBot;

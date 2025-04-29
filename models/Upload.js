const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    path: {
        type: String,
        required: true,
    }, 
    filename: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;

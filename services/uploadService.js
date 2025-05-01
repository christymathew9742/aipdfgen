const Upload = require('../models/Upload');
const { errorResponse } = require('../utils/errorResponse');

const saveFile = async (file) => {
    try {
            if (!file || !file.path || !file.originalname) {
                throw errorResponse('Invalid file data', 400);
            }

        const uploadData = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            filename: file.filename,
        };

        const newUpload = new Upload(uploadData);
        return await newUpload.save();
    } catch (err) {
        console.error('File save error:', err);
        throw errorResponse('Failed to save file to the database', 500);
    }
};

module.exports = {
    saveFile,
};





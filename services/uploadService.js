const Upload = require('../models/Upload');
const { errorResponse } = require('../utils/errorResponse');

const saveFile = async (file) => {
    try {
        const uploadData = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            filename: file.filename,
        };
        const saved = new Upload(uploadData);
        return await saved.save();
    } catch (error) {
        throw errorResponse('Error saving file to DB', 500);
    }
};

module.exports = {
    saveFile,
};

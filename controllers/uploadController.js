const uploadService = require('../services/uploadService');

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const savedFile = await uploadService.saveFile(req.file);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${savedFile.filename}`;
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadFile,
};

const uploadService = require('../services/uploadService');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); 
const sessionPdfData = require('../utils/sessionStore'); 

const uploadFile = async (req, res, next) => {
    const uploadedFileId = req.uploadedFileId;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        await uploadService.saveFile(req.file);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.uploadFolderPath}/${req.file.filename}`;

        try {
            const fileBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(fileBuffer);
            const extractedText = pdfData.text;

            sessionPdfData.set(uploadedFileId, {
                path: req.file.path,
                name: req.file.filename,
                extractedText,
            });

          } catch (error) {
            console.error('PDF AI Processing Error:', error);
          }
        
        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl,
            uploadedFileId,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadFile,
};



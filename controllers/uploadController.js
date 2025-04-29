const uploadService = require('../services/uploadService');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const sessionPdfData = require('../utils/sessionStore');
const { uploadAndExtract } = require('../ai/model/llamaClient');

const uploadFile = async (req, res, next) => {
    try {
        const uploadedFileId = req.uploadedFileId;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { path: filePath, filename } = req.file;
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.uploadFolderPath}/${filename}`;

        res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl,
            uploadedFileId,
        });

        (async () => {
            const io = req.app.get('io');
            
            const updateProgress = (progress, status) => {
                io.to(uploadedFileId).emit('extraction_progress', { uploadedFileId, progress, status });
            };
        
            try {
                const fileBuffer = fs.readFileSync(filePath);
                
                let extractedText = '';
                const pdfData = await pdfParse(fileBuffer);
                const isTextInsufficient = pdfData.text.trim().length < 20;
        
                if (isTextInsufficient) {
                    const response = await uploadAndExtract(filePath, io, uploadedFileId);
                    updateProgress(80, 'Fetching Extraction Results');
                    extractedText = JSON.stringify(response?.data || '', null, 2);
                } else {
                    extractedText = pdfData.text.trim();
                }
                await uploadService.saveFile(req.file);
                sessionPdfData.set(uploadedFileId, {
                    path: filePath,
                    name: filename,
                    extractedText,
                });
        
                updateProgress(100, 'Extraction Complited');
                io.to(uploadedFileId).emit('extraction_complete', { uploadedFileId});
        
            } catch (error) {
                console.error('[Background Extraction Error]', { error: error.message, uploadedFileId, filePath });
                io.to(uploadedFileId).emit('extraction_error', { uploadedFileId, error: error.message });
            }
        })();
        
    } catch (error) {
        console.error('Upload Error:', error);
        next(error);
    }
};

module.exports = {
    uploadFile,
};












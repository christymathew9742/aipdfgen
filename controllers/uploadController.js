const uploadService = require('../services/uploadService');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const sessionPdfData = require('../utils/sessionStore');
const { uploadAndExtract } = require('../ai/model/llamaClient');
const{summarizer,chunker} = require('../utils/summarizer')

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
                    updateProgress(60, 'Fetching Extraction Results');
                    extractedText = JSON.stringify(response?.data || '', null, 2);
                } else {
                    extractedText = pdfData.text.trim();
                }

                await uploadService.saveFile(req.file);

                if (extractedText.length>0) {
                    const chunks = chunker(extractedText, 
                        {
                            maxTokens: 4000,
                            overlap: 50,
                            sentenceSafe: true,
                            onError: (err) => console.log('Chunking error:', err)
                        }
                    );
                    updateProgress(70, 'Creating Chunk');
                    
                    const finalSummary = await summarizer(chunks, {
                        summarize: true,
                        finalSummarize: true,
                        onChunkProcessed: (summary, index) => {
                            console.log(`Chunk ${index + 1} summarized`);
                        },
                        onError: (err) => console.error(err)
                    });
                    updateProgress(90, 'Summarizing');

                    sessionPdfData.set(uploadedFileId, {
                        path: filePath,
                        name: filename,
                        finalSummary,
                    });
                }

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












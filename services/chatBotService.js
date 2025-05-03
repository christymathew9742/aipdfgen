const { errorResponse } = require('../utils/errorResponse');
const createAIResponse = require('../ai/services/aiServices');
const sessionPdfData = require('../utils/sessionStore');

const fileLocks = new Map();

const withLock = async (key, fn) => {
    while (fileLocks.get(key)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    fileLocks.set(key, true);
    try {
        return await fn();
    } finally {
        fileLocks.set(key, false);
    }
};

const createChatBot = async (req, res) => {
    try {
        const { prompt, uploadedFileId } = req.body;
        const io = req.app.get('io');
        if (!prompt || !uploadedFileId) {
            return res.status(400).json(errorResponse('Prompt and uploadedFileId are required', 400));
        }

        const fileData = sessionPdfData.get(uploadedFileId);

        if (!fileData) {
            return res.status(404).json(errorResponse('Uploaded file data not found in session store. Use latest uploadedFileId', 404));
        }

        if (!fileData.finalSummary) {
            return res.status(400).json(errorResponse('Summary not found. Try re-uploading the PDF.', 400));
        }

        req.body.pdfText = fileData.finalSummary;
        req.body.io = io;
        const aiResponse = await withLock(uploadedFileId, () => createAIResponse(req.body));

        return res.status(201).json({ success: true, data: aiResponse });

    } catch (error) {
        console.error('Error creating AI response:', error);
        return res.status(500).json(errorResponse('Internal Server Error', 500));
    }
};

module.exports = {
    createChatBot,
};




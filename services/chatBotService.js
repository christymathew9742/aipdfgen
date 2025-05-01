const { errorResponse } = require('../utils/errorResponse');
const createAIResponse = require('../ai/services/aiServices');
const sessionPdfData = require('../utils/sessionStore');
const rateLimit = require('express-rate-limit');

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

const createRateLimiter = () => {
    return rateLimit({
        windowMs: 60 * 1000,
        max: 5, 
        message: 'Too many requests, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
};

const createChatBot = async (chatData, res) => {
    try {
        const { prompt, uploadedFileId } = chatData;

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

        chatData.pdfText = fileData.finalSummary;

        const aiResponse = await withLock(uploadedFileId, () => createAIResponse(chatData));

        return res.status(201).json({ success: true, data: aiResponse });

    } catch (error) {
        console.error('Error creating AI response:', error);
        return res.status(500).json(errorResponse('Internal Server Error', 500));
    }
};

module.exports = {
    createChatBot,
    createRateLimiter,
};



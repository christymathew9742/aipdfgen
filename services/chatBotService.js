const ChatBot = require('../models/chatBot');
const { errorResponse } = require('../utils/errorResponse');
const createAIResponse = require('../ai/services/aiServices');
const sessionPdfData = require('../utils/sessionStore');

const createChatBot = async (chatData, res) => {
    try {
        const { prompt, uploadedFileId } = chatData;
    if (!prompt || !uploadedFileId) {
        return res.status(400).json(errorResponse('Prompt and uploadedFileId are required', 400));
    }
    const fileData = sessionPdfData.get(uploadedFileId);

    if (!fileData) {
        return res.status(404).json(errorResponse('Uploaded file data not found in sectiomn store. Use latest uploadedFileId', 404));
    }

    chatData.pdfText = fileData.extractedText;
    const aiResponse = await createAIResponse(chatData);
    return res.status(201).json({ success: true, data: aiResponse });

    } catch (error) {
        console.error('Error creating AI response:', error);
        return res.status(500).json(errorResponse('Internal Server Error', 500));
    }
};

module.exports = {
    createChatBot,
};



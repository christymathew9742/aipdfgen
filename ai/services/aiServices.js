const generateDynamicPrompt = require('../training/training');
const generateAIResponse = require('../model/aiModel');
const NodeCache = require('node-cache');

let userConversationHistories = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const updateConversationHistory = (uploadedFileId, prompt, aiResponse) => {
    let session = userConversationHistories.get(uploadedFileId);
    if (!session) {
        session = { conversation: [] };
    }

    session.conversation.push(`User Question: ${prompt}`);
    session.conversation.push(`AI answer: ${aiResponse}`);

    userConversationHistories.set(uploadedFileId, session);
};

const createAIResponse = async (chatData) => {
    try {
        const { prompt, uploadedFileId, pdfText, io } = chatData;
  
        if (!prompt || !pdfText?.trim()) return;

        let userSession = userConversationHistories.get(uploadedFileId) || {
            conversation: [],
            pdfText: null
        };

        if (!userSession.pdfText) {
            userSession.pdfText = pdfText;
        }

        userConversationHistories.set(uploadedFileId, userSession);

        const generatedPrompt = await generateDynamicPrompt(
            userSession.conversation,
            prompt,
            userSession.pdfText
        );

        const aiResponse = await generateAIResponse(generatedPrompt, 'prompt', io, uploadedFileId);

        updateConversationHistory(uploadedFileId, prompt, aiResponse);

        return aiResponse;
    } catch (error) {
        console.error('Error in processing:', error);
        return "Please be patient, my AI buddies are busy.";
    }
};

module.exports = createAIResponse;


















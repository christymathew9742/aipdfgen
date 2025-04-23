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
        const { prompt, uploadedFileId, pdfText } = chatData;

        let userSession = userConversationHistories.get(uploadedFileId);
        if (!userSession) {
            userSession = { conversation: [] };
            userConversationHistories.set(uploadedFileId, userSession);
        }

        const conversationHistory = userSession.conversation;

        const generatedPrompt = await generateDynamicPrompt(
            conversationHistory,
            prompt,
            pdfText
        );

        const aiResponse = await generateAIResponse(generatedPrompt);

        updateConversationHistory(uploadedFileId, prompt, aiResponse);

        return aiResponse;
    } catch (error) {
        console.error('Error in processing:', error);
        return "Please be patient, my AI buddies are busy.";
    }
};

module.exports = createAIResponse;














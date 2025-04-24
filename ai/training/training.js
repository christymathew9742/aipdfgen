const generateDynamicPrompt = async (
    conversationHistory,
    qustion,
    pdfText,
) => {
    if(!pdfText) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString();
 
    const prompt = `
        **TrainingData**: 
        **You are an PDF assistant. Below is the document content you must understand.**
        **Document Content**: 
            ${pdfText}

        **Include all previous messages for context**: 
        **ConversationHistory**:
        ${conversationHistory.join("\n")}
        
        **NewUserMessage The latest User message**:
        "${qustion}"

        **Dynamically calculated CurrentDateAndTime**:
        ${currentDate} (${currentYear}) - ${currentTime}

        **Availability Legend**:  
        Please respond clearly based on the document and conversationHistory and respond politely, naturally, focusing on the next necessary step. Follow the conversation.answer for all qustions maximum 200 words. if Document Content emply please inform to uploded "word based pdf not Image based pdf and low quality scanned pdf" and give clarity without fail.
    `;

    return prompt.trim();
};

module.exports = generateDynamicPrompt;




  

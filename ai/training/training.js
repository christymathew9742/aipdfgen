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
        ${conversationHistory.join("\n")}
        
        **NewUserMessage The latest User message**:
        "${qustion}"

        **Dynamically calculated CurrentDateAndTime**:
        ${currentDate} (${currentYear}) - ${currentTime}

        **Availability Legend**:  
        Please respond clearly based on the document and history and respond politely, naturally, focusing on the next necessary step. Follow the conversation.answer for all qustions maximum 200 words.
    `;

    return prompt.trim();
};

module.exports = generateDynamicPrompt;




  

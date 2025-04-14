const generateDynamicFlowData = require('./conversationFlowGenerator');
const instructions = require('./instructions');

const generateDynamicPrompt = async (
    conversationHistory,
    ConsultantMessage,
    flowTrainingData,
) => {
    if(!flowTrainingData) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString();
    const structuredFlow = generateDynamicFlowData(flowTrainingData, instructions);

    const flowData = structuredFlow.map(section => {
        return `- ${section.section}:\n  ${section.instructions.map(instr => `  - ${instr}`).join('\n')}`;
    }).join('\n');
 
    const prompt = `
        **TrainingData**: 
            **Key Features**:
            ${flowData}

        **Include all previous messages for context**:  
        ${conversationHistory.join("\n")}
        
        **NewConsultantMessage The latest consultant message**:
        "${ConsultantMessage}"

        **Dynamically calculated CurrentDateAndTime**:
        ${currentDate} (${currentYear}) - ${currentTime}

        **Availability Legend**:  

        Should respond politely and naturally, focusing on the next necessary step. Follow the conversation steps in order, based on the numbers. Ensure all responses are concise, with each answer limited to 20 words or fewer, focusing on clarity, conciseness, and precision. If appointments or any other related details are not mentioned in the conversation history, provide the available details or suggest an onsite visit, based on the situation.  without fail. Correct only the relevant part of the conversation without revising everything. Avoid repeating questions and ensure the response is relevant to the user's query. Provide dates in the format "month, day". Verify details before proceeding with any counseling information. Do not describe your internal steps or decisions during the conversation. Ensure an array object is created in conversationHistory after confirming the token number. The object must follow the format exactly as a string (only use JSON format, not in JavaScript format, and should not be assigned to a variable): {dId: consultingDoctorID, name: consultantName, age: consultantAge, doctor: consultingDoctor, date: consultingDate, token: consultantToken, department: consultantDepartment}. Implement this without fail and avoid using functions like push(). Analyze the emotions conveyed by images sent by the user and respond appropriately based on the image's meaning and mood.
    `;

    return prompt.trim();
};

module.exports = generateDynamicPrompt;




  

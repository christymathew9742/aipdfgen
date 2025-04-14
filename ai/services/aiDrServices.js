const { DrConsultantModal, DepartmentModal } = require('../../models/drAppointment/drModel');
const generateDynamicPrompt = require('../../ai/training/drTraining/preprocess');
const generateAIResponse = require('../model/aiModel');
const cleanAIResponse = require('../../utils/common');
const { ChatBotModel } = require('../../models/chatBotModel/chatBotModel');
const NodeCache = require('node-cache');

let userConversationHistories = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const updateConversationHistory = (
    userPhone, 
    patientMessage, 
    aiResponse
) => {
    if (!userConversationHistories[userPhone]) {
        userConversationHistories[userPhone] = { 
            conversation: [], 
            userOptionsDisplayed: false, 
            userOptions: null,
        };
    }
    userConversationHistories[userPhone].conversation.push(`Consultant: ${patientMessage}`);
    userConversationHistories[userPhone].conversation.push(`Eva: ${aiResponse}`);
};

const clearUserSessionData = (userPhone) => {
    const userSession = userConversationHistories.get(userPhone);
    if (userSession) {
        userSession.conversation = [];
        userSession.userOptionsDisplayed = false;
        userSession.userOptions = null;
        userConversationHistories.set(userPhone, userSession);
    }
};

const createAIResponse = async (userData) => {
    try {
        const { userPhone, userInput: prompt, userOption } = userData;
        if (!userConversationHistories[userPhone]) {
            userConversationHistories[userPhone] = { 
                conversation: [], 
                userOptionsDisplayed: false, 
                selectedOptions: null 
            };
        }

        const userSession = userConversationHistories[userPhone];

        if (userOption) {
            userSession.selectedOptions = userOption;
        }

        if (!userSession.userOptionsDisplayed) {
            const allOptions = await ChatBotModel.find({}, '_id title').lean();
            const optionsArray = allOptions.map(({ _id, title }) => ({ _id, title }));

            userSession.userOptionsDisplayed = true;
            return { optionsArray };
        }

        const storedUserOption = userSession.selectedOptions;

        const fetchFlowTrainingData = storedUserOption
            ? ChatBotModel.findOne({ _id: storedUserOption }, 'edges nodes').lean()
            : null;

        const fetchDoctorData = DepartmentModal.find().lean();
        const fetchRegularConsultantData = DrConsultantModal.findOne({ userPhone }).lean();

        const [flowTrainingData, doctorData, regularConsultantData] = await Promise.all([
            fetchFlowTrainingData,
            fetchDoctorData,
            fetchRegularConsultantData
        ]);

        const conversationHistory = userSession.conversation;

        const generatedPrompt = await generateDynamicPrompt(
            conversationHistory,
            prompt,
            flowTrainingData
        );

        const expectedKeys = ['dId', 'name', 'age', 'doctor', 'date', 'token', 'department'];
        const aiResponse = await generateAIResponse(generatedPrompt);
        const match = aiResponse && aiResponse?.match(/{[\s\S]*}/)?.[0];
        const extractedObjs = match ? JSON.parse(match) : {};
        const aiCleanedResponse = cleanAIResponse(aiResponse && aiResponse.replace(match || '', ''));
        const isAllKeys = expectedKeys.every((key) => Object.hasOwn(extractedObjs, key) && extractedObjs[key]);
        updateConversationHistory(userPhone, prompt, aiCleanedResponse);

        if (regularConsultantData && Object.keys(regularConsultantData)?.length) {
            const updatedFields = Object.fromEntries(
                Object?.entries(extractedObjs)
                    ?.filter(([key, value]) => 
                        expectedKeys?.includes(key) && 
                        value !== regularConsultantData[key]
                    )
            );

            if (Object.keys(updatedFields)?.length > 0) {
                await DrConsultantModal.updateOne({ userPhone }, { $set: updatedFields });
            }  
        } else if (isAllKeys && !regularConsultantData) {
            const newData = { ...userData, ...extractedObjs };
            const saved = await new DrConsultantModal(newData).save();

            if (saved) {
                const dIdArray = await DrConsultantModal.distinct('dId');
                const batchSize = 50;

                for (let i = 0; i < dIdArray.length; i += batchSize) {
                    const batch = dIdArray.slice(i, i + batchSize);
                    await Promise.all(
                        batch.map(async (elem) => {
                            const department = await DepartmentModal.findById(elem);
                            if (department) {
                                const currentTokenCount = await DrConsultantModal.countDocuments({ dId: elem });
                                const tokenStatus = department.totalToken - currentTokenCount;

                                if (department.currentToken !== currentTokenCount) {
                                    await DepartmentModal.findByIdAndUpdate(
                                        elem,
                                        {
                                            currentToken: currentTokenCount,
                                            tokenStatus,
                                        },
                                        { new: true, runValidators: true }
                                    );
                                }
                            }
                        })
                    );
                }
                clearUserSessionData(userPhone);
            }
        }

        return { message: aiCleanedResponse };
    } catch (error) {
        console.error('Error in processing:', error);
        return { message: "Please be patient, all my buddies are busy." };
    }
};

module.exports = createAIResponse;













const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MAX_RETRIES, RETRY_DELAY_MS } = require('../../config/constants');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateAIResponse = async (content, type='prompt', io = undefined, uploadedFileId='') => {
    if (!content) return null;

    const genAI = new GoogleGenerativeAI(process.env.API_GEM);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build prompt based on the type
    const buildPrompt = () => {
        switch (type) {
        case 'summarize':
            return `Summarize the following content:\n\n${content}\n\n *INPORTANT**:should not exceed 500 tokens of words.`;
        case 'prompt':
            return content;
        default:
            return content;
        }
    };

    let retries = 0;
    let result;
    while (retries < MAX_RETRIES) {
        try {
            const prompt = buildPrompt();
            result = await model.generateContent(prompt);

            if (result?.response) {
                return result.response.text();
            }
        } catch (error) {
            if ((error.status === 503 || error.status === 429) && retries < MAX_RETRIES - 1) {
                console.warn(`Retry ${retries + 1}: Quota or load issue. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await delay(RETRY_DELAY_MS);
                retries++;
            } else {
                const Error = 'Our servers are currently busy. Please try again in a moment.';
                console.error(Error, error.message);
                    if (type === 'prompt' && io && uploadedFileId) {
                        io.to(uploadedFileId).emit('internal_server_error', {
                            uploadedFileId,
                            Error,
                        });
                    }
                return null;
            }
        }
    }
    throw new Error('AI model failed after maximum retries.');
};

module.exports = generateAIResponse;





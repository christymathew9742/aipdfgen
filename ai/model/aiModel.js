
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const {MAX_RETRIES,RETRY_DELAY_MS} = require('../../config/constants')
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// const generateAIResponse = async (prompt) => {
//   const genAI = new GoogleGenerativeAI(process.env.API_GEM);
//   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

//   let retries = 0;
//   let result;

//   while (retries < MAX_RETRIES) {
//       if(!prompt) return null;

//       try {
//           result = await model.generateContent(prompt);
//           if (result) {
//               return result.response.text();
//           }
//       } catch (error) {
//           if (error.status === 503 && retries < MAX_RETRIES - 1) {
//               console.warn(`Retry ${retries + 1}: Model overloaded. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
//               await delay(RETRY_DELAY_MS);
//               retries++;
//           } else {
//               console.log("Failed to complete the request after max retries.", error.message);
//           }
//       }
//     return null;
//   }
//   throw new Error('AI model failed after maximum retries.');
// };

// module.exports = generateAIResponse;

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MAX_RETRIES, RETRY_DELAY_MS } = require('../../config/constants');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateAIResponse = async (content, type = 'prompt') => {
    if (!content) return null;

    const genAI = new GoogleGenerativeAI(process.env.API_GEM);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build prompt based on the type
    const buildPrompt = () => {
        switch (type.toLowerCase()) {
        case 'summarize':
            return `Summarize the following content:\n\n${content}\n\n *INPORTANT**:should not exceed 500 tokens of words.`;
        case 'prompt':
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
                console.error('Failed to complete the request:', error.message);
                return `"I'm currently experiencing high demand and unable to process your request at the moment. Kindly try again in a little while. Thank you for your patience!`;
            }
        }
    }
    throw new Error('AI model failed after maximum retries.');
};

module.exports = generateAIResponse;


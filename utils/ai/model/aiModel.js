
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {MAX_RETRIES,RETRY_DELAY_MS} = require('../../config/constants')
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const generateAIResponse = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.API_GEM);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let retries = 0;
  let result;

  while (retries < MAX_RETRIES) {
      if(!prompt) return null;

      try {
          result = await model.generateContent(prompt);//generateContentStream
          if (result) {
              return result.response.text();
          }
      } catch (error) {
          if (error.status === 503 && retries < MAX_RETRIES - 1) {
              console.warn(`Retry ${retries + 1}: Model overloaded. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
              await delay(RETRY_DELAY_MS);
              retries++;
          } else {
              console.log("Failed to complete the request after max retries.", error.message);
          }
      }
    return null;
  }
  //throw new Error('AI model failed after maximum retries.');
};

module.exports = generateAIResponse;

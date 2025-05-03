const Bottleneck = require('bottleneck');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MAX_RETRIES, RETRY_DELAY_MS, MAX_ALLOWED_DELAY_MS } = require('../../config/constants');

const RATE_LIMIT = process.env.RATE_LIMIT || 15;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const limiter = new Bottleneck({
    minTime: 4000,// 60000/RATE_LIMIT,
    maxConcurrent: 1,
    reservoir: RATE_LIMIT,
    reservoirRefreshAmount: 15,
    reservoirRefreshInterval: 60 * 1000, 
});

const generateAIResponse = async (content, type = 'prompt', io = undefined, uploadedFileId = '') => {
    if (!content) return null;

    const genAI = new GoogleGenerativeAI(process.env.API_GEM);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const buildPrompt = () => {
        switch (type) {
            case 'summarize':
                return `Summarize the following content:\n\n${content}\n\n**IMPORTANT**: Should not exceed 1000 tokens.`;
            case 'prompt':
            default:
                return content;
        }
    };

    const startTime = Date.now();

    const handleAIRequest = async () => {
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
                    console.warn(`Retry ${retries + 1}: Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                    await delay(RETRY_DELAY_MS);
                    retries++;
                } else {
                    const Error = 'Our servers are currently busy. Please try again shortly.';
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

    try {
        const responseText = await limiter.schedule(async () => {
            const result = await handleAIRequest();

            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > MAX_ALLOWED_DELAY_MS) {
                const errorMessage = `Request took too long: exceeded ${MAX_ALLOWED_DELAY_MS / 1000}s.`;
                if (io && uploadedFileId) {
                    io.to(uploadedFileId).emit('internal_server_error', {
                        uploadedFileId,
                        Error: errorMessage,
                    });
                }
                return null;
            }
            return result;
        });

        return responseText;
    } catch (error) {
        console.error('Final failure:', error.message);
        if (io && uploadedFileId) {
            io.to(uploadedFileId).emit('internal_server_error', {
                uploadedFileId,
                Error: 'Final failure after retries. Please try again later.',
            });
        }
        return null;
    }
};

module.exports = generateAIResponse;








const generateAIResponse = require('../ai/model/aiModel');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const countTokens = (text) => Math.ceil(text.length / 4);

function chunker(text, options = {}) {
    const {
        maxTokens = 512,
        overlap = 50,
        clean = true,
        sentenceSafe = false,
        onError = console.error,
    } = options;

    try {
        if (!text || typeof text !== 'string') throw new Error('Invalid input text');

        const cleaned = clean ? text.replace(/\s+/g, ' ').trim() : text;
        const words = cleaned.split(' ');

        const chunks = [];
        let i = 0;

        while (i < words.length) {
            let chunkWords = words.slice(i, i + maxTokens);

            if (sentenceSafe && i + maxTokens < words.length) {
                for (let j = chunkWords.length - 1; j >= 0; j--) {
                    if (/[.!?]$/.test(chunkWords[j])) {
                        chunkWords = chunkWords.slice(0, j + 1);
                        break;
                    }
                }
            }

            chunks.push(chunkWords.join(' '));
            i += maxTokens - overlap;
        }

        return chunks;
    } catch (error) {
        onError(`Chunking Error: ${error.message}`);
        return [];
    }
}

const summarizeChunk = async (chunk, promptType, retries = 3, retryDelay = 3000, onError = console.error) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await generateAIResponse(chunk, promptType);
        } catch (error) {
            if (attempt === retries) {
                onError(`Final attempt failed: ${error.message}`);
                return null;
            }
            onError(`Retry ${attempt} failed, retrying in ${retryDelay / 1000}s...`);
            await delay(retryDelay);
        }
    }
};

const recursiveFinalSummarize = async (
    text, 
    promptType, 
    tokenLimit = 1000, 
    onError = console.error
) => {
    const tokenCount = countTokens(text);

    if (tokenCount <= tokenLimit) {
        try {
            return await generateAIResponse(text, promptType);
        } catch (error) {
            onError(`Final summarization failed: ${error.message}`);
            return null;
        }
    }

    const newChunks = chunker(text, { maxTokens: tokenLimit - 100, overlap: 50, onError });
    const summarizedChunks = [];

    for (let i = 0; i < newChunks.length; i++) {
        const summary = await summarizeChunk(newChunks[i], promptType, 2, 1000, onError);
        summarizedChunks.push(summary);
    }

    return await recursiveFinalSummarize(summarizedChunks.join('\n\n'), promptType, tokenLimit, onError);
};

const summarizer = async (
    chunks,
    {
        summarize = true,
        finalSummarize = true,
        promptType = 'summarize',
        onChunkProcessed = () => {},
        onError = console.error,
        retries = 3,
        retryDelay = 3000,
        chunkDelay = 200,
        finalTokenLimit = 512,
    } = {}
) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return '';

    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const summary = summarize ? await summarizeChunk(chunk, promptType, retries, retryDelay, onError) : chunk;

        chunkSummaries.push(summary);
        onChunkProcessed(summary, i);

        if (i < chunks.length - 1) await delay(chunkDelay);
    }

    const combined = chunkSummaries.filter(Boolean).join('\n\n');

    if (!finalSummarize) return combined;

    return await recursiveFinalSummarize(combined, promptType, finalTokenLimit, onError);
};

module.exports = {
    chunker,
    summarizer,
};



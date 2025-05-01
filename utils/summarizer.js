const generateAIResponse = require('../ai/model/aiModel');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


function chunker(text, options = {}) {
    const {
        maxTokens = 512,
        overlap = 50,
        clean = true,
        sentenceSafe = false,
        onError = null,
    } = options;

    try {
        if (!text || typeof text !== 'string') throw new Error('Invalid input text');

        const cleanedText = clean ? text.replace(/\s+/g, ' ').trim() : text;
        const words = cleanedText.split(' ');

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
        console.error('Chunking Error:', error.message);
        if (typeof onError === 'function') onError(error);
        return [];
    }
}

const summarizeChunk = async (chunk, promptType, retries = 3, retryDelay = 5000, onError) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await generateAIResponse(chunk, promptType);
        } catch (error) {
            attempt++;
            if (attempt >= retries) {
                onError(`Failed after ${attempt} attempts: ${error.message}`);
                throw error;
            }
            console.log(`Retrying summarization (attempt ${attempt}) in ${retryDelay / 1000}s...`);
            await delay(retryDelay);
        }
    }
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
        retryDelay = 5000,
        chunkDelay = 300,
    } = {}
) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return '';

    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
            const summary = summarize ? await summarizeChunk(chunk, promptType, retries, retryDelay, onError) : chunk;
            chunkSummaries.push(summary);
            onChunkProcessed(summary, i);
        } catch (error) {
            chunkSummaries.push(''); 
        }

        if (i < chunks.length - 1) await delay(chunkDelay); 
    }

    const combinedSummary = chunkSummaries.filter(Boolean).join('\n\n');
    
    if (finalSummarize) {
        try {
            const finalSummary = await generateAIResponse(combinedSummary, 'summarize');
            const tokenCount = Math.ceil(finalSummary.length / 4);

            if (tokenCount > 512) {
                onError(`Final summary exceeds token limit (${tokenCount} tokens). Returning combined summaries instead.`);
                return `**ERROR MESSAGE**: Final summary exceeds token limit (${tokenCount} tokens). Please upload a smaller PDF.`;
            }
            return finalSummary;
        } catch (err) {
            onError('Final summarization failed: ' + err.message);
            return combinedSummary;
        }
    }
    return combinedSummary;
};

module.exports = {
    chunker,
    summarizer,
};


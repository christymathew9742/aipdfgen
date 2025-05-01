
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

// Setup llama client
const llamaClient = axios.create({
    baseURL: 'https://api.cloud.llamaindex.ai/api',
    headers: {
        Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
    },
});

// Upload a document and get file_id
const uploadFile = async (filePath) => {
    try {
        const form = new FormData();
        form.append('upload_file', fs.createReadStream(filePath), { contentType: 'application/pdf' });

        const response = await llamaClient.post('/v1/files', form, {
            headers: {
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        return response.data.id;
    } catch (error) {
        console.error('Error uploading file:', error.response?.data || error.message);
        throw error;
    }
};

// Run extraction job
const runExtractionJob = async (agentId, fileId) => {
    try {
        const response = await llamaClient.post('/v1/extraction/jobs', {
            extraction_agent_id: agentId,
            file_id: fileId,
            config: {
                extraction_mode: 'PARSE',
                extraction_target: 'PER_DOC',
                system_prompt: null,
                use_reasoning: false,
                cite_sources: false,
            },
        });

        return response.data.id;
    } catch (error) {
        console.error('Error starting extraction job:', error.response?.data || error.message);
        throw error;
    }
};

// Poll job status
const pollJobStatus = async (jobId, updateProgress) => {
    try {
        while (true) {
            const { data } = await llamaClient.get(`/v1/extraction/jobs/${jobId}`)

            if (data.status === 'SUCCESS') return true;
            if (data.status === 'ERROR') updateProgress(30, `Polling Job ${data.status.toLowerCase()}`)

            if (data.status === 'FAILED') throw new Error('Extraction job failed.');

            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch (error) {
        console.error('Error polling job status:', error.response?.data || error.message);
        throw error;
    }
};

// Get extraction result
const getExtractionResult = async (jobId) => {
    try {
        const { data } = await llamaClient.get(`/v1/extraction/jobs/${jobId}/result`);
        return data;
    } catch (error) {
        console.error('Error getting extraction result:', error.response?.data || error.message);
        throw error;
    }
};

const uploadAndExtract = async (filePath, io, uploadedFileId) => {
    const updateProgress = (progress, status) => {
        io.to(uploadedFileId).emit('extraction_progress', { uploadedFileId, progress, status });
    };

    try {
        const fileId = await uploadFile(filePath);
        updateProgress(10, 'Uploading File');

        const jobId = await runExtractionJob(process.env.AGENT_ID, fileId);
        updateProgress(20, 'Starting Extraction Job');

        const status = await pollJobStatus(jobId, updateProgress);
        updateProgress(30, 'Job Submitted');

        if (!status) {
            throw new Error(`Extraction job failed or incomplete: ${status}`);
        }

        const result = await getExtractionResult(jobId);
        updateProgress(50, 'Processing Data');

        return result;
    } catch (error) {
        console.error(`[uploadAndExtract] Error: ${error.message}`, { filePath, uploadedFileId });
        io.to(uploadedFileId).emit('extraction_error', { uploadedFileId, error: error.message });
        throw error;
    }
};

module.exports = {
    uploadAndExtract,
};



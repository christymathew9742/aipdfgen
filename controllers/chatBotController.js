const chatBotService = require('../services/chatBotService');
const { errorResponse } = require('../utils/errorResponse');

const createChatBot = async (req, res, next) => {
    try {
        const chatBotData = req.body;
        await chatBotService.createChatBot(req,res);
    } catch (error) {
        next(errorResponse(error));
    }
};

module.exports = {
    createChatBot,
};



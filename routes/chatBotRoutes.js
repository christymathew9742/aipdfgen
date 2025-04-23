const express = require('express');
const { createChatBot} = require('../controllers/chatBotController');
const router = express.Router();

router.post('/', createChatBot);

module.exports = router;



const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
console.log(chatController);


router.post('/createChat', chatController.createChat);
router.get('/chats', chatController.getChats);
router.get('/messages/:chatId', chatController.getChatMessages);

module.exports = router;

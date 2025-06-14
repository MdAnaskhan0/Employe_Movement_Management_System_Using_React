const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/', messageController.getAllMessages);
router.get('/:teamId', messageController.getMessagesByTeam);
router.post('/', messageController.createMessage);

module.exports = router;
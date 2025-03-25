const { Router } = require('express');
const {
  processNewMessage,
  getChat,
  getAllChats,
  createChat,
} = require('../controllers/chatController');
const { passport } = require('../config/passport');

const chatRouter = Router();

chatRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getAllChats
);

chatRouter.get('/:chatId', getChat);

chatRouter.post(
  '/:recipientId/message',
  passport.authenticate('jwt', { session: false }),
  processNewMessage
);

module.exports = chatRouter;

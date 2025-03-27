const { Router } = require('express');
const {
  getChatById,
  getAllChats,
  getPrivateChatByMembers,
  processPrivateMessage,
  processGroupMessage,
} = require('../controllers/chatController');
const { passport } = require('../config/passport');

const chatRouter = Router();

chatRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getAllChats
);

chatRouter.get('/groups/:chatId', getChatById);

chatRouter.get(
  '/private',
  passport.authenticate('jwt', { session: false }),
  getPrivateChatByMembers
);

chatRouter.post(
  '/private/message/:recipientId',
  passport.authenticate('jwt', { session: false }),
  processPrivateMessage
);

chatRouter.post(
  '/groups/message/:chatId',
  passport.authenticate('jwt', { session: false }),
  processGroupMessage
);

module.exports = chatRouter;

const { Router } = require('express');
const {
  processNewMessage,
  getChat,
} = require('../controllers/messageController');
const { passport } = require('../config/passport');

const messageRouter = Router();

messageRouter.get('/:chatId', getChat);

messageRouter.post(
  '/:chatId/new',
  passport.authenticate('jwt', { session: false }),
  processNewMessage
);

module.exports = messageRouter;

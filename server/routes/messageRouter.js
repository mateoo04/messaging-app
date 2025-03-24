const { Router } = require('express');
const { processNewMessage } = require('../controllers/messageController');
const { passport } = require('../config/passport');

const messageRouter = Router();

messageRouter.post(
  '/:chatId/new',
  passport.authenticate('jwt', { session: false }),
  processNewMessage
);

module.exports = messageRouter;

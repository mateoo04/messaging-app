const express = require('express');
const authRouter = require('./authRouter');
const messageRouter = require('./messageRouter');

const indexRouter = express();

indexRouter.use('/auth', authRouter);
indexRouter.use('/chats', messageRouter);

indexRouter.get('/', (req, res) =>
  res.json({ message: 'Welcome to the Messaging App API!' })
);

module.exports = indexRouter;

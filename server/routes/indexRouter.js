const express = require('express');
const authRouter = require('./authRouter');
const chatRouter = require('./chatRouter');
const usersRouter = require('./usersRouter');

const indexRouter = express();

indexRouter.use('/auth', authRouter);
indexRouter.use('/users', usersRouter);
indexRouter.use('/chats', chatRouter);

indexRouter.get('/', (req, res) =>
  res.json({ message: 'Welcome to the Messaging App API!' })
);

module.exports = indexRouter;

const express = require('express');
const authRouter = require('./authRouter');

const indexRouter = express();

indexRouter.use('/auth', authRouter);

indexRouter.get('/', (req, res) =>
  res.json({ message: 'Welcome to the Messaging App API!' })
);

module.exports = indexRouter;

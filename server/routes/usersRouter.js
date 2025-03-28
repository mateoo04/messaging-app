const { Router } = require('express');
const { getAllUsers, getUserById } = require('../controllers/usersController');
const { passport } = require('../config/passport');

const usersRouter = Router();

usersRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getAllUsers
);

usersRouter.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  getUserById
);

module.exports = usersRouter;

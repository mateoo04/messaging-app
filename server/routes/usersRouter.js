const { Router } = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
} = require('../controllers/usersController');
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

usersRouter.post(
  '/update',
  passport.authenticate('jwt', { session: false }),
  updateUser
);

module.exports = usersRouter;

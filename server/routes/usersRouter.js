const { Router } = require('express');
const { getAllUsers } = require('../controllers/usersController');
const { passport } = require('../config/passport');

const usersRouter = Router();

usersRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getAllUsers
);

module.exports = usersRouter;

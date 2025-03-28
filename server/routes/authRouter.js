const { Router } = require('express');

const { signUp, logIn, logOut } = require('../controllers/authController');
const { validateSignUp, validateLogIn } = require('../lib/validators');
const { passport } = require('../config/passport');

const authRouter = Router();

authRouter.post('/sign-up', validateSignUp, signUp);

authRouter.post('/log-in', validateLogIn, logIn);

authRouter.post(
  '/validate-credentials',
  passport.authenticate('jwt', { session: false }),
  (req, res) =>
    res.json({
      success: true,
      user: {
        displayName: req.user.displayName,
        username: req.user.username,
        id: req.user.id,
      },
    })
);

authRouter.post('/log-out', logOut);

module.exports = authRouter;

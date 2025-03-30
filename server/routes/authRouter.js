const { Router } = require('express');

const { signUp, logIn, logOut } = require('../controllers/authController');
const { validateSignUp, validateLogIn } = require('../lib/validators');
const { passport } = require('../config/passport');
const { events } = require('../config/events');

const authRouter = Router();

authRouter.post('/sign-up', validateSignUp, signUp);

authRouter.post('/log-in', validateLogIn, logIn);

authRouter.post(
  '/validate-credentials',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    events.emit('statusChange', { userId: req.user.id, isOnline: true });

    return res.json({
      success: true,
      user: {
        displayName: req.user.displayName,
        username: req.user.username,
        id: req.user.id,
        profilePhotoUrl: req.user.profilePhotoUrl,
      },
    });
  }
);

authRouter.post(
  '/log-out',
  passport.authenticate('jwt', { session: false }),
  logOut
);

module.exports = authRouter;

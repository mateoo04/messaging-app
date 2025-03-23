const { Router } = require('express');

const { signUp, logIn } = require('../controllers/authController');
const { validateSignUp, validateLogIn } = require('../lib/validators');

const authRouter = Router();

authRouter.post('/sign-up', validateSignUp, signUp);

authRouter.post('/log-in', validateLogIn, logIn);

module.exports = authRouter;

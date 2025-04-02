const { Strategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies.authToken) {
    token = req.cookies.authToken;
    token = token.replace('Bearer ', '');
  }

  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.SECRET,
};

passport.use(
  new Strategy(options, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (user) return done(null, user);
      else return done(null, false);
    } catch (err) {
      return done(err, null);
    }
  })
);

module.exports = { passport };

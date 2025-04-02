const jwt = require('jsonwebtoken');

function issueJWT(user) {
  const token = jwt.sign({ id: user.id }, process.env.SECRET, {
    expiresIn: '7d',
  });

  return {
    token: 'Bearer ' + token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}

module.exports = { issueJWT };

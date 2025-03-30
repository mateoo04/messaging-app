const redis = require('./redis');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const extractId = (cookies) => {
  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const authToken = parsedCookies.authToken;
    const authTokenExpiry = parsedCookies.authTokenExpiry;

    if (authToken && authTokenExpiry && authTokenExpiry > Date.now()) {
      const decoded = jwt.verify(
        authToken.replace('Bearer ', ''),
        process.env.SECRET
      );

      return decoded.id;
    }
  }
};

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);

    const id = extractId(socket.handshake.headers.cookie);

    if (id) {
      await redis.sAdd('onlineUsers', id);
    }

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      const id = extractId(socket.handshake.headers.cookie);

      if (id) {
        await redis.sRem('onlineUsers', id);
      }
    });

    socket.on('join room', async (roomId) => {
      if (!roomId) return;
      await socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('join rooms', async (roomIds) => {
      if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) return;
      await socket.join(roomIds);
      console.log(`Socket ${socket.id} joined rooms ${roomIds}`);
    });

    socket.on('leave room', async (roomId) => {
      if (!roomId) return;
      await socket.leave(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
  });
};

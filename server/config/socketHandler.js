const redis = require('./redis');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
      try {
        await redis.sAdd('onlineUsers', id);
      } catch (error) {
        console.error('Error getting online users from Redis: ', error);
      }
    }

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      const id = extractId(socket.handshake.headers.cookie);

      if (id) {
        try {
          await redis.sRem('onlineUsers', id);
        } catch (error) {
          console.error(
            'Error removing a user from online users on Redis: ',
            error
          );
        }
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

    socket.on('mark chat read', async (chatId) => {
      if (await prisma.chat.findUnique({ where: { id: chatId } })) {
        await prisma.chat.update({
          where: { id: chatId },
          data: { isUnread: false },
        });
      }
    });

    socket.on('leave room', async (roomId) => {
      if (!roomId) return;
      await socket.leave(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
  });
};

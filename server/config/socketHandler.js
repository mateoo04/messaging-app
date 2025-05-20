const redis = require('./redis');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { events } = require('./events');

const prisma = new PrismaClient();

const extractId = (cookies) => {
  try {
    if (cookies) {
      const parsedCookies = cookie.parse(cookies);
      const authToken = parsedCookies.authToken;

      if (authToken) {
        const decoded = jwt.verify(
          authToken.replace('Bearer ', ''),
          process.env.SECRET
        );

        return decoded.id;
      }
    }
  } catch {
    console.error('Error extracting ID from cookies');
  }
};

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);

    if (socket.userId) {
      socket.userId = id;

      try {
        await redis.sAdd('onlineUsers', id);
      } catch (error) {
        console.error('Error getting online users from Redis: ', error);
      }
    }

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      const id = extractId(socket.handshake.headers.cookie);

      if (socket.userId) {
        try {
          await redis.sRem('onlineUsers', socket.userId);
        } catch (error) {
          console.error(
            'Error removing a user from online users on Redis: ',
            error
          );
        }
      }

      events.emit('statusChange', { userId: id, isOnline: false });
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

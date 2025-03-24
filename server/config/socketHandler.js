module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('message', ({ roomId, message }) => {
      if (!roomId || !message) return;
      console.log('Message received:', data);
      io.to(roomId).emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('join room', async (roomId) => {
      if (!roomId) return;
      await socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    socket.on('leave room', async (roomId) => {
      if (!roomId) return;
      await socket.leave(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
  });
};

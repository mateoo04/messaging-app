const EventEmitter = require('events');
const events = new EventEmitter();

let ioInstance;

const setUpSocketEvents = (io) => {
  ioInstance = io;

  events.on('newMessage', ({ message, senderSocketId }) => {
    if (!ioInstance) return;

    ioInstance
      .to(message.chatId)
      .except(senderSocketId)
      .emit('message', message);
  });

  events.on('newPrivateChat', ({ userId, chat }) => {
    if (!ioInstance) return;

    ioInstance.to(`events-${userId}`).emit('newPrivateChat', chat);
  });
};

module.exports = { events, setUpSocketEvents };

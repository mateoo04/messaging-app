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

  events.on('newPrivateChat', ({ recipientId, chat }) => {
    if (!ioInstance) return;

    console.log(`emitting new chat event to events-${recipientId}`);

    ioInstance.to(`events-${recipientId}`).emit('newPrivateChat', chat);
  });
};

module.exports = { events, setUpSocketEvents };

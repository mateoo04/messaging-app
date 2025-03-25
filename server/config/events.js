const EventEmitter = require('events');
const events = new EventEmitter();

let ioInstance;

const setUpSocketEvents = (io) => {
  ioInstance = io;

  events.on('newMessage', ({ message, senderSocketId }) => {
    if (!ioInstance) return;
    console.log('Socket id:' + senderSocketId);
    ioInstance
      .to(message.chatId)
      .except(senderSocketId)
      .emit('message', message);
  });
};

module.exports = { events, setUpSocketEvents };

const EventEmitter = require('events');
const events = new EventEmitter();

let ioInstance;

const setUpSocketEvents = (io) => {
  ioInstance = io;

  events.on('newMessage', (message) => {
    if (!ioInstance) return;
    console.log('Hello');
    io.to(message.chatId).emit('message', message);
  });
};

module.exports = { events, setUpSocketEvents };

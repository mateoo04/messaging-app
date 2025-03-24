const EventEmitter = require('events');
const events = new EventEmitter();

let ioInstance;

const setUpSocketEvents = (io) => {
  ioInstance = io;

  events.on('newMessage', (message) => {
    io.emit('message', message);
  });
};

module.exports = { events, setUpSocketEvents };

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { passport } = require('./config/passport');

const indexRouter = require('./routes/indexRouter');
const socketHandler = require('./config/socketHandler');
const { events, setUpSocketEvents } = require('./config/events');
const redis = require('./config/redis');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

const server = http.createServer(app);
const io = new Server(server, {
  pingInterval: 1000,
  pingTimeout: 2000,
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

socketHandler(io);
setUpSocketEvents(io);

app.use('/api', indexRouter);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

server.listen(process.env.PORT || 4000, () =>
  console.log(`Server listening on port ${process.env.PORT || 4000}!`)
);

const { PrismaClient } = require('@prisma/client');
const { events } = require('../config/events');
const { passport } = require('../config/passport');

const prisma = new PrismaClient();

async function getAllChats(req, res, next) {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        AND: [
          {
            members: {
              some: {
                id: req.user.id,
              },
            },
          },
          {
            messages: {
              some: {},
            },
          },
        ],
      },
    });
    return res.json({ chats });
  } catch (err) {
    next(err);
  }
}

async function getChat(req, res, next) {
  try {
    if (req.params.chatId != 'global-chat')
      passport.authenticate('jwt', { session: false });

    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.chatId,
      },
      include: {
        messages: {
          orderBy: {
            time: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                username: true,
              },
            },
          },
        },
        members: true,
      },
    });

    return res.json(chat);
  } catch (err) {
    next(err);
  }
}

async function getChatId(ids) {
  const exists = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { id: ids[0] } } },
        { members: { some: { id: ids[1] } } },
      ],
    },
  });

  if (!exists) {
    const chat = await prisma.chat.create({
      data: {
        members: {
          connect: ids.map((id) => ({ id })),
        },
      },
    });

    return chat.id;
  } else return exists.id;
}

async function processNewMessage(req, res, next) {
  try {
    let chatId;
    if (!req.params?.recipientId)
      return res.status(401).json({ message: 'Recipient not provided' });
    else if (req.params.recipientId == 'global-chat')
      chatId = req.params.recipientId;
    else chatId = getChatId([req.user.id, req.params.recipientId]);

    if (!req.body.text.length)
      return res
        .status(401)
        .json({ message: 'No text attached to the message' });

    const message = await prisma.message.create({
      data: {
        text: req.body.text,
        senderId: req.user.id,
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });
    events.emit('newMessage', { message, senderSocketId: req.body.socketId });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

module.exports = { processNewMessage, getChat, getAllChats };

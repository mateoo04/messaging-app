const { PrismaClient } = require('@prisma/client');
const { events } = require('../config/events');

const prisma = new PrismaClient();

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

async function processNewMessage(req, res, next) {
  try {
    if (!req.body.text.length)
      return res
        .status(401)
        .json({ message: 'No text attached to the message' });

    const message = await prisma.message.create({
      data: {
        text: req.body.text,
        senderId: req.user.id,
        chatId: req.params.chatId,
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

    events.emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

module.exports = { processNewMessage, getChat };

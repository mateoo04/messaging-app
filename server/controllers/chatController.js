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
      include: {
        members: true,
        messages: {
          orderBy: {
            time: 'desc',
          },
          take: 1,
          include: {
            sender: true,
          },
        },
      },
    });
    return res.json({ chats });
  } catch (err) {
    next(err);
  }
}

async function getChatById(req, res, next) {
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

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    return res.json(chat);
  } catch (err) {
    next(err);
  }
}

async function getPrivateChatByMembers(req, res, next) {
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { members: { some: { id: req.user.id } } },
          { members: { some: { id: req.query.memberId } } },
          {
            members: {
              every: { id: { in: [req.user.id, req.query.memberId] } },
            },
          },
        ],
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

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    return res.json(chat);
  } catch (err) {
    next(err);
  }
}

async function getPrivateChatId(ids) {
  const exists = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { id: ids[0] } } },
        { members: { some: { id: ids[1] } } },
        {
          members: {
            every: { id: { in: ids } },
          },
        },
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

async function processPrivateMessage(req, res, next) {
  try {
    if (!req.params.recipientId)
      return res.status(400).json({ message: 'Recipient id not provided' });

    const chatId = await getPrivateChatId([
      req.user.id,
      req.params.recipientId,
    ]);

    processNewMessage(req, res, chatId);
  } catch (err) {
    next(err);
  }
}

async function processGroupMessage(req, res, next) {
  try {
    if (!req.params.chatId)
      return res.status(400).json({ message: 'Chat id not provided' });

    processNewMessage(req, res, req.params.chatId);
  } catch (err) {
    next(err);
  }
}

async function processNewMessage(req, res, chatId) {
  if (!req.body.text.length)
    return res.status(400).json({ message: 'No text attached to the message' });

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

  return res.status(201).json(message);
}

module.exports = {
  processPrivateMessage,
  processGroupMessage,
  getChatById,
  getAllChats,
  getPrivateChatByMembers,
};

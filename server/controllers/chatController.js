const { PrismaClient } = require('@prisma/client');
const { events } = require('../config/events');
const { passport } = require('../config/passport');

const prisma = new PrismaClient();

async function getAllChats(req, res, next) {
  try {
    let chats = await prisma.chat.findMany({
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

    chats.sort((a, b) => {
      return b.messages?.at(0)?.time - a.messages?.at(0)?.time;
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

async function getPrivateChatId(userId, recipientId) {
  const exists = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { id: userId } } },
        { members: { some: { id: recipientId } } },
        {
          members: {
            every: { id: { in: [userId, recipientId] } },
          },
        },
      ],
    },
  });

  if (!exists) {
    const chat = await prisma.chat.create({
      data: {
        members: {
          connect: [{ id: userId }, { id: recipientId }],
        },
      },
    });

    return { isNewChat: true, chatId: chat.id };
  } else return { isNewChat: false, chatId: exists.id };
}

async function saveMessage(req, res, chatId) {
  if (!req.body.text.length && !req.body.imageUrl)
    return res.status(400).json({ message: 'Message empty' });

  const message = await prisma.message.create({
    data: {
      text: req.body.text || undefined,
      imageUrl: req.body.imageUrl || undefined,
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
      chat: {
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
      },
    },
  });

  return message;
}

async function processPrivateMessage(req, res, next) {
  try {
    if (!req.params.recipientId)
      return res.status(400).json({ message: 'Recipient id not provided' });

    const { isNewChat, chatId } = await getPrivateChatId(
      req.user.id,
      req.params.recipientId
    );

    if (isNewChat) {
      const message = await saveMessage(req, res, chatId);

      const chat = await prisma.chat.findUnique({
        where: {
          id: message.chatId,
        },
        include: {
          members: true,
          messages: {
            include: {
              sender: true,
            },
          },
        },
      });

      events.emit('newPrivateChat', {
        recipientId: req.params.recipientId,
        chat,
      });

      return res.status(201).json(message);
    } else {
      const message = await saveMessage(req, res, chatId);

      events.emit('newMessage', { message, senderSocketId: req.body.socketId });

      return res.status(201).json(message);
    }
  } catch (err) {
    next(err);
  }
}

async function processGroupMessage(req, res, next) {
  try {
    if (!req.params.chatId)
      return res.status(400).json({ message: 'Chat id not provided' });

    const message = await saveMessage(req, res, req.params.chatId);

    events.emit('newMessage', { message, senderSocketId: req.body.socketId });

    return res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  processPrivateMessage,
  processGroupMessage,
  getChatById,
  getAllChats,
  getPrivateChatByMembers,
};

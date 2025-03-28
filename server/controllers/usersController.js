const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: req.user.id,
            },
          },
          {
            username: {
              contains: req.query?.search,
            },
          },
        ],
      },
    });

    return res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = req.params.userId;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById };

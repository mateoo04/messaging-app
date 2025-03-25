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

module.exports = { getAllUsers };

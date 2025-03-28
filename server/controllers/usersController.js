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

async function updateUser(req, res, next) {
  try {
    const { profilePhotoUrl, displayName } = req.query;

    if (!profilePhotoUrl && !displayName)
      return res.status(400).json({ message: 'No data to update provided' });

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        profilePhotoUrl: profilePhotoUrl || undefined,
        displayName: displayName || undefined,
      },
    });

    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById, updateUser };

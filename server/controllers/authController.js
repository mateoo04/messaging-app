const { issueJWT } = require('../lib/utils');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const redis = require('../config/redis');
const { events } = require('../config/events');

const prisma = new PrismaClient();

async function respond(res, successStatusCode, user) {
  const tokenObj = issueJWT(user);

  res.cookie('authToken', tokenObj.token, {
    httpOnly: true,
  });
  res.cookie('authTokenExpiry', tokenObj.expiresAt, {
    httpOnly: true,
  });
  res.cookie('username', user.username, {
    httpOnly: false,
  });

  await redis.sAdd('onlineUsers', user.id);
  events.emit('statusChange', { userId: user.id, isOnline: true });

  res.status(successStatusCode).json({
    success: true,
    user: {
      displayName: user.displayName,
      username: user.username,
      id: user.id,
      profilePhotoUrl: user.profilePhotoUrl,
    },
  });
}

async function signUp(req, res, next) {
  const errors = validationResult(req)
    .array()
    .map((error) => ({ field: error.path, message: error.msg }));
  if (errors.length != 0) {
    return res.status(400).json(errors);
  }

  try {
    const userWithEnteredUsername = await prisma.user.findFirst({
      where: {
        username: req.body.username,
      },
    });

    if (userWithEnteredUsername) {
      return res
        .status(409)
        .json({ message: 'User with that username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        displayName: req.body.displayName,
        username: req.body.username,
        password: hashedPassword,
      },
    });

    respond(res, 201, user);
  } catch (err) {
    next(err);
  }
}

async function logIn(req, res, next) {
  const errors = validationResult(req)
    .array()
    .map((error) => ({ field: error.path, message: error.msg }));
  if (errors.length != 0) {
    return res.status(400).json(errors);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      return res.status(401).json('Invalid credentials');
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      respond(res, 200, user);
    } else res.status(401).json('Invalid credentials');
  } catch (err) {
    next(err);
  }
}

async function logOut(req, res, next) {
  await redis.sRem('onlineUsers', req.user.id);
  events.emit('statusChange', { userId: req.user.id, isOnline: false });
  res.clearCookie('authToken', { httpOnly: true });
  res.clearCookie('authTokenExpiry', { httpOnly: true });
  res.clearCookie('username', { httpOnly: false });
  res.status(200).json({ success: true, message: 'Logged out' });
}

module.exports = { signUp, logIn, logOut };

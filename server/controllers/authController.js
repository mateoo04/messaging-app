const { issueJWT } = require('../lib/utils');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

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

    const tokenObj = issueJWT(user);

    res.cookie('authToken', tokenObj, {
      httpOnly: true,
    });

    res.status(201).json({
      success: true,
      user: {
        displayName: user.displayName,
        username: user.username,
        id: user.id,
      },
    });
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
      const tokenObj = issueJWT(user);

      res.cookie('authToken', tokenObj, {
        httpOnly: true,
      });

      res.json({
        success: true,
        user: {
          displayName: user.displayName,
          username: user.username,
          id: user.id,
        },
      });
    } else res.status(401).json('Invalid credentials');
  } catch (err) {
    next(err);
  }
}

module.exports = { signUp, logIn };

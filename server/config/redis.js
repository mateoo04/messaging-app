const { createClient } = require('redis');

const redis = createClient();

redis.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
  try {
    await redis.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Error connecting to Redis:', error);
  }
}

connectRedis();

module.exports = redis;

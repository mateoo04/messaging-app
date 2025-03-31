const { createClient } = require('redis');

const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

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

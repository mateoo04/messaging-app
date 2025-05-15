const { createClient } = require('redis');

const redis = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redis.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
  try {
    await redis.connect();
    console.log('Connected to Redis');

    await redis.del('onlineUsers');
    console.log('Cleared online users set on Redis.');
  } catch (err) {
    console.error('Error connecting to Redis:', error);
  }
}

connectRedis();

module.exports = redis;

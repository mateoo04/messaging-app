const { createClient } = require('redis');

const redis = createClient();

redis.on('error', (err) => console.log('Redis Client Error', err));

async function connectRedis() {
  await redis.connect();
}

connectRedis();

module.exports = redis;

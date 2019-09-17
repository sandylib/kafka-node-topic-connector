const Redis = require("ioredis");
const config = require('../config');

const redisClient = new Redis({ port: config.redis.port, host: config.redis.host });

const getOffset = async () => {
  const offset = await redisClient.get(config.redis.recoveryKey);
  return offset;
};

const updateOffset = async incomingOffset => {
  await redisClient.set(config.redis.recoveryKey, incomingOffset);
  const updatedOffset = await redisClient.get(config.redis.recoveryKey);
  return updatedOffset;
};

module.exports = {
  getOffset,
  updateOffset
};
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line global-require
  require("dotenv").load();
}

const config = {
  kafka: {
    kafkaHost: process.env.KAFKA_BROKERS,
    notificationTopic: process.env.KAFKA_COMMUNICATION_TOPIC,
    kafkaDlqTopic: process.env.KAFA_DLQ_TOPIC,
    groupId: process.env.NOTIFICATION_TOPIC_GROUP_ID,
    timeWindowInterval: process.env.TIME_WINDOW_INTERVAL,
    timezonePrefix: process.env.TIMEZONE_PREFIX,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    recoveryKey: process.env.REDIS_RECOVERY_KEY,
  },
  zookeeper: process.env.ZOOKEEPER_SERVER,
  
};

module.exports = config;

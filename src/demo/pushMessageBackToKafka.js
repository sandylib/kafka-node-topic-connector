const asyncTap = require("./operators/asyncTap");

const uuid = require("uuid/v4");

const pushMessageBackToKafka = kafkaConnector =>
  asyncTap(async messages => {
    const topic = 'topic' + uuid();
    await kafkaConnector.dispatchNotifications(topic, messages);
  });

module.exports = pushMessageBackToKafka;

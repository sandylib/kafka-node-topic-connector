const { KafkaClient, Consumer, KeyedMessage, Producer, Offset } = require("kafka-node");
const { Observable } = require("rxjs");

const recoveryAgent = require("./services/recoveryAgent");

const uuid = require('uuid/v4');

class KafkaConnector {
  constructor(options = {}) {
    const { kafkaHost } = options;

    this.client = new KafkaClient({
      ...options,
      autoConnect: true,
      clientId: `kf-client-id-${uuid()}`
    });
    this.options = options;
    console.log("KafkaConnector constructor - this.client: ", this.client);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.on("ready", resolve);
      this.client.on("error", err => {
        console.error({ err }, "Error connecting to Kafka");
        console.log("KafkaConnector connect - this.client", this.client);
        reject(err);
      });
      this.client.connect();
    });
  }

  disconnect() {
    return new Promise(resolve => this.client.close(resolve));
  }

  getConsumer(options) {
    if (!this.consumer) {
      console.log("***** PATH = instantiating new consumer...");
      this.connect();
      const consumerPayload = {
        topic: this.options.notificationTopic
      };
      const consumerOptions = {};
      if (options && options.offset) {
        consumerPayload.offset = options.offset;
        consumerOptions.fromOffset = true;
      }
      this.consumer = new Consumer(
        this.client,
        [consumerPayload],
        consumerOptions
      );
    }
    return this.consumer;
  }

  async getProducer() {
    if (!this.producer) {
      return new Promise((resolve, reject) => {
        this.producer = new Producer(this.client);
        this.producer.on("ready", resolve);
        this.producer.on("error", err => {
          // logger.error({ err }, "Error creating Kafka producer");
          reject(err);
        });
        this.producer.connect();
      });
    }
    return this.producer;
  }

  async dispatchNotifications(topic, messages = []) {
    await this.getProducer();
    const keyedMessages = messages.map(({ key, value }) => new KeyedMessage(key, JSON.stringify(value)));
    this.producer.send(
      [
        {
          topic: topic,
          messages: keyedMessages
        }
      ],
      () => { }
    );
  }

  createObservableStream(requireRedis = true) {
    return Observable.create(async observer => {
      const consumerOptions = {};
      let currentConsumer;
      const resumptionOffset = requireRedis ? await recoveryAgent.getOffset() : null;
      if (resumptionOffset) {
        consumerOptions.offset = resumptionOffset;
      } else {
        const offset = new Offset(this.client);

        await new Promise((resolve, reject) => {
          offset.fetch([{ topic: this.options.notificationTopic, partition: 0, time: "-1" }], (err, data) => {
            consumerOptions.offset = data[this.options.notificationTopic][0][0];
            resolve();
          });
        });
      } 
      currentConsumer = this.getConsumer({
        ...consumerOptions
      });

      currentConsumer.on("message", async message => {
        try {
          observer.next(message);
        } catch (error) {
          console.error(error);
          observer.error(error);
        }
      });

      currentConsumer.on("offsetOutOfRange", err => {
        console.log("offsetOutOfRange errror: ", err);
        observer.error(err);
      });

      currentConsumer.on("error", someOtherErr => {
        console.log("someOtherErr: ", someOtherErr);
        observer.error(someOtherErr);
      });
    
  });
};
}


module.exports = KafkaConnector;

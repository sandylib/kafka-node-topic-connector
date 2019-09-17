## kafka-node-topic-connector library is a high-performance NodeJS client for Apache Kafka 

### it works with rxjs change steam to Observable Stream also include redix to remember the last offset key 

```javascrip
const { map } = require("rxjs/operators");

const util = require("../util");
const config = require("../config"); // your config for connect to kafka
const KafkaConnector = require('kafka-node-topic-connector');
const log = require("./operators/log");

const pushMessageBackToKafka = require("./pushMessageBackToKafka");


const kafkaConnector = new KafkaConnector(config.kafka);
const kafkaStream = kafkaConnector.createObservableStream();
const source = kafkaStream
  .pipe(map(util.deserialize))
  .pipe(log('after util.deserialize'))
  //do some procesing here
  //after could push messages back to kafka 
  .pipe(pushMessageBackToKafka(kafkaConnector))


module.exports = source;

```

```javascrip

const source = require("./stream");
const util = require("./util");


source.subscribe(...util.observer);

```
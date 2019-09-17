const { map } = require("rxjs/operators");

const util = require("../util");
const config = require("../config");
const KafkaConnector = require('../../src/');
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
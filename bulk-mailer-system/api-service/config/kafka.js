const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'bulk-mailer-api',
  brokers: ['localhost:9092']
});

const admin = kafka.admin();
const producer = kafka.producer();

module.exports = { kafka, admin, producer };

const readline = require("readline");
const { admin } = require('../config/kafka');

function askPartitions() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question("Enter number of partitions: ", (answer) => {
      const partitions = parseInt(answer);

      if (isNaN(partitions) || partitions <= 0) {
        console.log("Invalid partition number");
        process.exit();
      }

      rl.close();
      resolve(partitions);
    });
  });
}

async function setupTopic(partitionsRequested) {
  await admin.connect();

  const metadata = await admin.fetchTopicMetadata({
    topics: ["bulk-emails"]
  });

  const topicExists = metadata.topics.length > 0;

  if (!topicExists) {
    await admin.createTopics({
      topics: [{
        topic: "bulk-emails",
        numPartitions: partitionsRequested,
        replicationFactor: 1
      }]
    });
    console.log(`Topic created with ${partitionsRequested} partitions`);
  } else {
    const currentPartitions = metadata.topics[0].partitions.length;

    if (partitionsRequested > currentPartitions) {
      await admin.createPartitions({
        topicPartitions: [{
          topic: "bulk-emails",
          count: partitionsRequested
        }]
      });
      console.log(`Partitions increased to ${partitionsRequested}`);
    } else {
      console.log(`Topic already has ${currentPartitions} partitions`);
      console.log("Partition count cannot be reduced");
    }
  }

  await admin.disconnect();
}

module.exports = { askPartitions, setupTopic };

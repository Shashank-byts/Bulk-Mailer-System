require('dotenv').config();
const express = require('express');
const emailRoutes = require('./routes/emailRoutes');
const { producer } = require('./config/kafka');
const { askPartitions, setupTopic } = require('./utils/kafkaSetup');

const app = express();
app.use(express.json());

// Routes
app.use('/api', emailRoutes);

const PORT = process.env.PORT || 3000;

// Start the server
const start = async () => {
  try {
    const partitions = await askPartitions();
    await setupTopic(partitions);
    await producer.connect();

    app.listen(PORT, () => {
      console.log(`API service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();

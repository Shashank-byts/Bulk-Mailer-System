const { v4: uuidv4 } = require('uuid');
const { producer } = require('../config/kafka');
const generateEmail = require('../utils/aiGenerator');

const sendBulkEmails = async (req, res) => {
  try {
    const { emails, description, subject: reqSubject, body: reqBody } = req.body;
    
    // Check if the emails array is valid
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Valid "emails" array is required' });
    }

    let subject = reqSubject;
    let body = reqBody;

    // Use AI generator if description is provided
    if (description) {
      console.log('Generating email content using AI with description:', description);
      try {
        const generatedData = await generateEmail(description);
        
        subject = generatedData.subject;
        body = generatedData.body;

        if (!subject || !body) {
           throw new Error("AI output was not in the expected format. Missing subject or body in JSON.");
        }
      } catch (aiError) {
        console.error("AI Generation Error:", aiError);
        return res.status(500).json({ error: 'Failed to generate email content from AI' });
      }
    } else if (!subject || !body) {
      return res.status(400).json({ error: 'Either "description" or both "subject" and "body" are required' });
    }
    
    // Connect to the kafka broker
    await producer.connect();
    const batchId = uuidv4();
    
    // Create the messages to be sent to the kafka topic
    const messages = emails.map(email => ({
      value: JSON.stringify({
        batchId,
        email,
        subject,
        body
      })
    }));
    
    // Send the messages to the kafka topic
    console.log("Sending messages to Kafka:", messages);
    await producer.send({
      // using key to ensure that the messages are sent to the same partition
      key: batchId,
      topic: 'bulk-emails',
      messages: messages,
    });
    
    // Send the response to the client
    res.status(202).json({ message: `Queued ${emails.length} emails for sending` });
  } catch (error) {
    console.error('Error queuing emails:', error);
    res.status(500).json({ error: 'Failed to queue emails' });
  }
};

module.exports = { sendBulkEmails };

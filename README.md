# Bulk Mailer System

## Architecture
- **API Service (Node.js)**: Accepts HTTP POST requests containing emails and queues them in a Kafka topic.
- **Worker Service (Python)**: Consumes messages from the Kafka topic and "sends" the emails.
- **Kafka**: Message broker used for asynchronous communication.

## Setup Instructions

### 1. Start Kafka
Navigate to the `kafka` directory and start the services using docker-compose:
```bash
cd kafka
docker-compose up -d
```

### 2. Setup API Service
Open a new terminal, navigate to the `api-service` directory, and install dependencies. 

**Important:** Before starting the server, create a `.env` file in the `api-service` directory and add your OpenAI API Key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

Start the server:
```bash
cd api-service
npm install
node server.js
```
The API will run on http://localhost:3000. It will prompt you for the number of Kafka partitions to create/use.

### 3. Setup Worker Service
Open a new terminal, navigate to the `worker-service` directory, install Python dependencies, and run the worker:
```bash
cd worker-service
pip install -r requirements.txt
python worker.py
```

## Testing
You can test the system by sending a POST request to the API `http://localhost:3000/api/send-bulk`.

### Option 1: AI-Generated Content
Send a list of emails with a `description`. The AI will automatically generate the `subject` and `body`.
```bash
curl -X POST http://localhost:3000/api/send-bulk \
-H "Content-Type: application/json" \
-d '{
  "emails": ["user1@example.com", "user2@example.com"],
  "description": "Write a professional update email directly to our users letting them know the website will be down for maintenance on Saturday from 2 AM to 4 AM EST."
}'
```

### Option 2: Manual Content (Fallback)
If you do not provide a `description`, you must provide the `subject` and `body` manually.
```bash
curl -X POST http://localhost:3000/api/send-bulk \
-H "Content-Type: application/json" \
-d '{
  "emails": ["user1@example.com", "user2@example.com", "user3@example.com"],
  "subject": "Hello from Bulk Mailer",
  "body": "This is a test message."
}'
```

You should receive a 202 response from the API, and the Python worker terminal should log the emails being "sent".

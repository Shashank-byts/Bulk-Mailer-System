import json
import time
from confluent_kafka import Consumer, KafkaError, KafkaException

def send_email(email, subject, body):
    # Mocking email sending
    print(f"Sending email to: {email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("-" * 20)
    time.sleep(1) # Simulate processing time

def main():
    conf = {
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'python-email-workers',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(conf)
    
    # Subscribe to topic
    topic = 'bulk-emails'
    consumer.subscribe([topic])
    
    print(f"Worker started. Listening to topic '{topic}'...")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None: continue

            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    # End of partition event
                    pass
                elif msg.error():
                    raise KafkaException(msg.error())
            else:
                try:
                    # Parse the message value
                    data = json.loads(msg.value().decode('utf-8'))
                    email = data.get('email')
                    subject = data.get('subject', 'No Subject')
                    body = data.get('body', '')
                    
                    send_email(email, subject, body)
                    
                    # Manually commit if needed, here auto commit is usually fine for simple case
                except json.JSONDecodeError as e:
                    print(f"Failed to decode message: {e}")
                except Exception as e:
                    print(f"Error processing message: {e}")
                    
    except KeyboardInterrupt:
        print("Worker interrupted by user.")
    finally:
        # Close down consumer to commit final offsets.
        consumer.close()

if __name__ == '__main__':
    main()

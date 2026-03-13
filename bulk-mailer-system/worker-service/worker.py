import json
import time
import os
import smtplib
from email.message import EmailMessage
from confluent_kafka import Consumer, KafkaError, KafkaException
from dotenv import load_dotenv

# Load local .env file
load_dotenv()

SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', 'your_email@gmail.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', 'your_app_password')

def send_email(email, subject, body):
    print(f"\n[🔄] Preparing to send email to: {email}")
    
    try:
        # Create the email message
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = SMTP_USERNAME
        msg['To'] = email
        msg.set_content(body)
        
        # If body looks like HTML, let's also add it as an HTML alternative just in case
        if "<html>" in body.lower() or "<p>" in body.lower():
            msg.add_alternative(body, subtype='html')

        # Connect to server
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls() # Secure the connection
            server.ehlo()
            
            # Authenticate with credentials securely
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
                print(f"[✅] SUCCESS: Email successfully delivered to {email}")
            else:
                print(f"[⚠️] WARNING: SMTP credentials not properly set. Mocking send to {email}.")
                time.sleep(1) # Simulate
    except Exception as e:
        print(f"[❌] ERROR: Failed to send email via SMTP to {email}: {e}")
        print("-" * 40 + "\n")

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

import json
from confluent_kafka import Producer

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll() or flush(). """
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

def test_producer():
    conf = {'bootstrap.servers': 'localhost:9092'}
    producer = Producer(conf)

    topic = 'bulk-emails'
    message = {
        'email': 'demonsparkcp@gmail.com', # Sending to the same user email to verify
        'subject': 'Test Email from Bulk Mailer System',
        'body': '<h1>Hello!</h1><p>This is a test email sent via Kafka and processed by Python SMTP worker!</p>'
    }

    # Trigger sending
    producer.produce(
        topic, 
        json.dumps(message).encode('utf-8'), 
        callback=delivery_report
    )
    
    # Wait for any outstanding messages to be delivered and delivery report
    # callbacks to be triggered.
    producer.flush()

if __name__ == '__main__':
    test_producer()

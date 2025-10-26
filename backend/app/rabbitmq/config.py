from dotenv import load_dotenv
from os import getenv


load_dotenv()

RMQ_HOST = getenv('RMQ_HOST', 'rabbitmq')
RMQ_PORT = getenv('RMQ_PORT', '5672')
RMQ_USERNAME = getenv('RMQ_USERNAME', 'guest')
RMQ_PASSWORD = getenv('RMQ_PASSWORD', 'guest')

RMQ_URL = f'amqp://{RMQ_USERNAME}:{RMQ_PASSWORD}@{RMQ_HOST}:{RMQ_PORT}/'
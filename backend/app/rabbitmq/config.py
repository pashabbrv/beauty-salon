from dotenv import load_dotenv
from os import getenv


load_dotenv()

RMQ_HOST = getenv('RMQ_HOST')
RMQ_PORT = getenv('RMQ_PORT')
RMQ_USERNAME = getenv('RMQ_USERNAME')
RMQ_PASSWORD = getenv('RMQ_PASSWORD')

RMQ_URL = f'amqp://{RMQ_USERNAME}:{RMQ_PASSWORD}@{RMQ_HOST}:{RMQ_PORT}/'

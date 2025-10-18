from dotenv import load_dotenv
from os import getenv

load_dotenv()

INSTANCE_ID = getenv("GREENAPI_INSTANCE_ID") or ""
API_TOKEN = getenv("GREENAPI_API_TOKEN") or ""

BASE_URL = f"https://api.green-api.com/waInstance{INSTANCE_ID}"

RMQ_HOST = getenv("RMQ_HOST")
RMQ_PORT = getenv("RMQ_PORT")
RMQ_USERNAME = getenv("RMQ_USERNAME")
RMQ_PASSWORD = getenv("RMQ_PASSWORD")

RMQ_URL = f"amqp://{RMQ_USERNAME}:{RMQ_PASSWORD}@{RMQ_HOST}:{RMQ_PORT}/"

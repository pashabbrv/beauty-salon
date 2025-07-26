from dotenv import load_dotenv
from os import getenv


load_dotenv()

POSTGRES_HOST = getenv('POSTGRES_HOST')
POSTGRES_PORT = int(getenv('POSTGRES_PORT'))
POSTGRES_USER = getenv('POSTGRES_USER')
POSTGRES_PASSWORD = getenv('POSTGRES_PASSWORD')
POSTGRES_NAME = getenv('POSTGRES_NAME')

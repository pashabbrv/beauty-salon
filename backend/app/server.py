from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.postgresql import session_factory, create_tables
from db.models import Customer, Appointment


app = FastAPI(on_startup=[create_tables])

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)




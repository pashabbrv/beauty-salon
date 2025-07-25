from datetime import datetime
from pydantic import BaseModel


class SimpleAppointment(BaseModel):
    name: str
    phone: str
    service: str
    master: str
    datetime: datetime

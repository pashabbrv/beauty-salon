from datetime import datetime as datetime_cls
from pydantic import BaseModel


class SimpleAppointment(BaseModel):
    name: str
    phone: str
    service: str
    master: str
    datetime: datetime_cls


class UpdateAppointment(BaseModel):
    service: str | None = None
    master: str | None = None
    datetime: datetime_cls | None = None
    confirmed: bool | None = None


class NewService(BaseModel):
    name: str


class DBService(BaseModel):
    id: int
    name: str

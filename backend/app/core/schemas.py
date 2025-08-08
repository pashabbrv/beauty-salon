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


class ServiceInfo(BaseModel):
    name: str

class ServiceDB(ServiceInfo):
    id: int
    name: str


class MasterInfo(BaseModel):
    phone: str
    name: str

class MasterDB(MasterInfo):
    id: int

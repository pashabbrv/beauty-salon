from datetime import time
from pydantic import BaseModel


'''class SimpleAppointment(BaseModel):
    name: str
    phone: str
    service: str
    master: str
    datetime: datetime_cls


class UpdateAppointment(BaseModel):
    service: str | None = None
    master: str | None = None
    datetime: datetime_cls | None = None
    confirmed: bool | None = None'''


class ServiceInfo(BaseModel):
    name: str

class ServiceDB(ServiceInfo):
    id: int

    class Config:
        from_attributes = True


class MasterInfo(BaseModel):
    phone: str
    name: str

class MasterDB(MasterInfo):
    id: int

    class Config:
        from_attributes = True


class OfferingCreate(BaseModel):
    master_id: int
    service_id: int
    price: int
    duration: time

class OfferingGet(BaseModel):
    id: int
    master: MasterDB
    service: ServiceDB
    price: int
    duration: time

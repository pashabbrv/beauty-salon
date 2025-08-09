from datetime import datetime, time
from pydantic import BaseModel


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

    class Config:
        from_attributes = True


'''class AppointmentCreate(BaseModel):
    name: str
    phone: str
    offering_id: int
    datetime: datetime

class AppointmentGet(BaseModel):
    name: str
    phone: str
    offering: OfferingGet
    datetime: datetime
    confirmed: bool
    created_at: bool'''

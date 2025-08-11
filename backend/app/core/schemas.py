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


class TimeSlot(BaseModel):
    start: datetime
    end: datetime

class AppointmentCreate(BaseModel):
    name: str
    phone: str
    offering_id: int
    datetime: datetime

class AppointmentGet(BaseModel):
    id: int
    name: str
    phone: str
    offering: OfferingGet
    slot: TimeSlot
    confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerGet(BaseModel):
    id: int
    phone: str
    name: str
    status: str
    created_at: datetime


class CustomersStatusUpdate(BaseModel):
    status: str

from datetime import datetime, time
from pydantic import BaseModel, Field
from typing import Annotated


phone_str = Annotated[str, Field(min_length=2, max_length=20)]
name_str = Annotated[str, Field(min_length=2, max_length=100)]


class ServiceInfo(BaseModel):
    name: name_str

class ServiceDB(ServiceInfo):
    id: int

    class Config:
        from_attributes = True


class MasterInfo(BaseModel):
    phone: phone_str
    name: name_str

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
    name: name_str
    phone: phone_str
    offering_id: int
    datetime: datetime

class AppointmentGet(BaseModel):
    id: int
    name: name_str
    phone: phone_str
    offering: OfferingGet
    slot: TimeSlot
    confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerGet(BaseModel):
    id: int
    phone: phone_str
    name: name_str
    status: Annotated[str, Field(max_length=10)]
    created_at: datetime


class CustomersStatusUpdate(BaseModel):
    status: Annotated[str, Field(max_length=10)]

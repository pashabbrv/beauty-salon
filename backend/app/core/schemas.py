from datetime import datetime as datetimetype, time
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


class AppointmentCreate(BaseModel):
    name: str
    phone: str
    offering_id: int
    datetime: datetimetype

class AppointmentGet(BaseModel):
    id: int
    name: str
    phone: str
    offering: OfferingGet
    datetime: datetimetype
    confirmed: bool
    created_at: datetimetype

    class Config:
        from_attributes = True


class CustomerGet(BaseModel):
    id: int
    phone: str
    name: str
    status: str
    created_at: datetimetype


class CustomersStatusUpdate(BaseModel):
    status: str

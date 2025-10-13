from datetime import datetime, time
from pydantic import BaseModel, Field
from typing import Annotated


phone_str = Annotated[str, Field(min_length=2, max_length=20)]
name_str = Annotated[str, Field(min_length=2, max_length=100)]
id_int = Annotated[int, Field(gt=0)]
price_type = Annotated[int, Field(ge=0)]


class ServiceInfo(BaseModel):
    """Модель с основной информацией об услуге
    \n_(по-умолчанию используется верификация **словаря**)_"""
    name: name_str


class ServiceDB(ServiceInfo):
    """Модель со всей информацией об услуге из базы данных
    \n_(по-умолчанию используется верификация **модели**)_"""
    id: id_int

    class Config:
        from_attributes = True


class MasterInfo(BaseModel):
    """Модель с основной информацией о мастере
    \n_(по-умолчанию используется верификация **словаря**)_"""
    phone: phone_str
    name: name_str


class MasterDB(MasterInfo):
    """Модель со всей информацией о мастере из базы данных
    \n_(по-умолчанию используется верификация **модели**)_"""
    id: id_int

    class Config:
        from_attributes = True


class OfferingCreate(BaseModel):
    """Модель с основной информацией, используемой для создания услуги мастера
    \n_(по-умолчанию используется верификация **словаря**)_"""
    master_id: id_int
    service_id: id_int
    price: price_type
    duration: time


class OfferingDBBase(BaseModel):
    """Модель с базовой информацией об услуге мастера из базы данных
    \n_(по-умолчанию используется верификация **модели**)_"""
    id: id_int
    price: price_type
    duration: time

    class Config:
        from_attributes = True


class OfferingGetMaster(OfferingDBBase):
    """Модель с базовой информацией об услуге мастера и о самом мастере
    \n_(по-умолчанию используется верификация **модели**)_"""
    master: MasterDB


class OfferingGetService(OfferingDBBase):
    """Модель с базовой информацией об услуге мастера и о самой услуге
    \n_(по-умолчанию используется верификация **модели**)_"""
    service: ServiceDB


class OfferingGet(OfferingGetMaster, OfferingGetService):
    """Модель со всей информацией об услуге мастера (включая мастера и услугу)
    \n_(по-умолчанию используется верификация **модели**)_"""
    pass


class TimeSlot(BaseModel):
    """Модель с информацией о временном слоте
    \n_(по-умолчанию используется верификация **словаря**)_"""
    start: datetime
    end: datetime


class AppointmentCreate(BaseModel):
    """Модель с основной информацией, используемой для создания записи
    \n_(по-умолчанию используется верификация **словаря**)_"""
    name: name_str
    phone: phone_str
    offering_id: id_int
    datetime: datetime


class AppointmentGet(BaseModel):
    """Модель со всей информацией о записи (кроме кода подтверждения)
    \n_(по-умолчанию используется верификация **модели**)_"""
    id: id_int
    name: name_str
    phone: phone_str
    offering: OfferingGet
    slot: TimeSlot
    confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ConfirmationCode(BaseModel):
    """Модель для взаимодействия с кодом подтверждения записи
    \n_(по-умолчанию используется верификация **словаря**)_"""
    confirmation_code: Annotated[str, Field(min_length=2, max_length=8)]


class CustomerGet(BaseModel):
    """Модель со всей информацией о пользователе из базы данных
    \n_(по-умолчанию используется верификация **модели**)_"""
    id: id_int
    phone: phone_str
    name: name_str
    status: Annotated[str, Field(max_length=10)]
    created_at: datetime


class CustomersStatusUpdate(BaseModel):
    """Модель для обновления статуса пользователя
    \n_(по-умолчанию используется верификация **словаря**)_"""
    status: Annotated[str, Field(max_length=10)]


class OKModel(BaseModel):
    """Модель ответа для {"message": "OK"}"""
    message: Annotated[str, Field(default='OK')]

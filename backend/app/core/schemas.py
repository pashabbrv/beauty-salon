from datetime import datetime, time, date
from pydantic import BaseModel, Field
from typing import Annotated, Optional, ClassVar, Optional


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
    status: Annotated[str, Field(max_length=20)]
    created_at: datetime


class CustomersStatusUpdate(BaseModel):
    """Модель для обновления статуса пользователя
    \n_(по-умолчанию используется верификация **словаря**)_"""
    status: Annotated[str, Field(max_length=20)]


# New schema for the specific status types
class CustomerStatusTypes:
    """Класс для определения типов статусов клиентов"""
    NEW: ClassVar[str] = "new"
    REGULAR: ClassVar[str] = "regular"
    CAPRICIOUS: ClassVar[str] = "capricious"
    
    @classmethod
    def get_all_statuses(cls):
        return [cls.NEW, cls.REGULAR, cls.CAPRICIOUS]


class OKModel(BaseModel):
    """Модель ответа для {"message": "OK"}"""
    message: Annotated[str, Field(default='OK')]


# Product schemas
class ProductCreate(BaseModel):
    """Модель для создания нового товара
    Хранит общий объем/количество товара (например, 1000 мл шампуня или 100 упаковок краски)"""
    name: name_str
    price: price_type  # Цена за единицу (за 1 мл или 1 штуку)
    quantity: Annotated[int, Field(ge=0)]  # Общий объем/количество в единицах
    unit: Annotated[str, Field(max_length=20)]  # 'milliliters' или 'pieces'


class ProductUpdate(BaseModel):
    """Модель для обновления информации о товаре"""
    name: Optional[name_str] = None
    price: Optional[price_type] = None
    quantity: Optional[Annotated[int, Field(ge=0)]] = None
    unit: Optional[Annotated[str, Field(max_length=20)]] = None


class ProductDB(BaseModel):
    """Модель для получения информации о товаре из базы данных
    Хранит общий объем/количество товара"""
    id: id_int
    name: name_str
    price: price_type  # Цена за единицу (за 1 мл или 1 штуку)
    quantity: int  # Общий объем/количество в единицах
    unit: str
    created_at: datetime

    class Config:
        from_attributes = True


# Cash Register schemas
class TransactionCreate(BaseModel):
    """Модель для создания новой транзакции
    При использовании товаров, стоимость товаров вычитается из общей суммы транзакции"""
    offering_id: Optional[id_int] = None
    product_id: Optional[id_int] = None
    product_quantity_used: Optional[Annotated[int, Field(ge=0)]] = None
    overtime_amount: Optional[price_type] = None
    total_amount: int  # Общая сумма, из которой будет вычтена стоимость товаров (может быть отрицательной до обработки)
    transaction_type: Annotated[str, Field(max_length=20)]  # 'income', 'expense', or 'collection'
    transaction_date: date


class TransactionUpdate(BaseModel):
    """Модель для обновления транзакции"""
    offering_id: Optional[id_int] = None
    product_id: Optional[id_int] = None
    product_quantity_used: Optional[Annotated[int, Field(ge=0)]] = None
    overtime_amount: Optional[price_type] = None
    total_amount: Optional[int] = None
    transaction_type: Optional[Annotated[str, Field(max_length=20)]] = None  # 'income', 'expense', or 'collection'
    transaction_date: Optional[date] = None


class TransactionDB(BaseModel):
    """Модель для получения информации о транзакции из базы данных
    Сумма транзакции уже учитывает вычет стоимости использованных товаров"""
    id: id_int
    offering_id: Optional[id_int] = None
    product_id: Optional[id_int] = None
    product_quantity_used: Optional[int] = None
    overtime_amount: Optional[price_type] = None
    total_amount: int  # Скорректированная сумма с учетом стоимости товаров (неотрицательная)
    transaction_type: str  # 'income', 'expense', or 'collection'
    transaction_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class CashSummary(BaseModel):
    """Модель для получения сводной информации о кассе"""
    date: date
    income: int
    expenses: int
    balance: int
from datetime import datetime
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import Annotated


intpk = Annotated[int, mapped_column(primary_key=True, autoincrement=True, unique=True)]


class Base(DeclarativeBase):
    pass


class Customer(Base):
    __tablename__ = 'customers'

    id: Mapped[intpk]
    phone: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(100))


class Appointment(Base):
    __tablename__ = 'appointments'

    id: Mapped[intpk]
    customer_id: Mapped[int] = mapped_column(ForeignKey('customers.id', ondelete='SET NULL'))
    service: Mapped[str] = mapped_column(String(100))
    master: Mapped[str] = mapped_column(String(100))
    datetime: Mapped[datetime]
    confirmed: Mapped[bool] = mapped_column(default=False)

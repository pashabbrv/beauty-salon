from datetime import datetime, timedelta
from sqlalchemy import String, ForeignKey, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import Annotated


int_pk = Annotated[int, mapped_column(primary_key=True, autoincrement=True, unique=True)]
creation_time = Annotated[datetime, mapped_column(server_default=text('CURRENT_TIMESTAMP'))]


class Base(DeclarativeBase):
    pass


class Customer(Base):
    __tablename__ = 'customers'

    id: Mapped[int_pk]
    phone: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[creation_time]


class Master(Base):
    __tablename__ = 'masters'

    id: Mapped[int_pk]
    phone: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(100))


class Service(Base):
    __tablename__ = 'services'

    id: Mapped[int_pk]
    name: Mapped[str] = mapped_column(String(100))


class Offering(Base):
    __tablename__ = 'offerings'

    id: Mapped[int_pk]
    master_id: Mapped[int] = mapped_column(
        ForeignKey('masters.id', ondelete='CASCADE')
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey('services.id', ondelete='CASCADE')
    )
    price: Mapped[int]
    duration: Mapped[timedelta]


class Appointment(Base):
    __tablename__ = 'appointments'

    id: Mapped[int_pk]
    name: Mapped[str] = mapped_column(String(100))
    customer_id: Mapped[int] = mapped_column(
        ForeignKey('customers.id', ondelete='SET NULL')
    )
    offering_id: Mapped[int] = mapped_column(
        ForeignKey('offerings.id', ondelete='SET NULL')
    )
    datetime: Mapped[datetime]
    confirmed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[creation_time]


class Absence(Base):
    __tablename__ = 'absences'

    id: Mapped[int_pk]
    master_id: Mapped[int] = mapped_column(
        ForeignKey('masters.id', ondelete='CASCADE')
    )
    start: Mapped[datetime]
    end: Mapped[datetime]
    created_at: Mapped[creation_time]

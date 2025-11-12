from datetime import datetime, time, date
from sqlalchemy import String, ForeignKey, text, DateTime, Date, Numeric
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship
)
from sqlalchemy.ext.hybrid import hybrid_property
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
    status: Mapped[str] = mapped_column(String(20))  # Increased size to accommodate new statuses
    created_at: Mapped[creation_time]


class Master(Base):
    __tablename__ = 'masters'

    # Основные поля в таблице
    id: Mapped[int_pk]
    phone: Mapped[str] = mapped_column(String(20))
    name: Mapped[str] = mapped_column(String(100))

    # Отношения с другими ORM
    offerings: Mapped[list['Offering']] = relationship(
        back_populates='master',
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class Service(Base):
    __tablename__ = 'services'

    # Основные поля в таблице
    id: Mapped[int_pk]
    name: Mapped[str] = mapped_column(String(100))

    # Отношения с другими ORM
    offerings: Mapped[list['Offering']] = relationship(
        back_populates='service',
        cascade='all, delete-orphan',
        passive_deletes=True
)


class Product(Base):
    __tablename__ = 'products'

    # Основные поля в таблице
    id: Mapped[int_pk]
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[int]  # Цена за единицу в сомах (за 1 мл или 1 штуку)
    quantity: Mapped[int]  # Общий объем/количество в единицах (миллилитры или штуки)
    unit: Mapped[str] = mapped_column(String(20))  # Единица измерения ('milliliters' или 'pieces')
    created_at: Mapped[creation_time]


class Offering(Base):
    __tablename__ = 'offerings'

    # Основные поля в таблице
    id: Mapped[int_pk]
    master_id: Mapped[int] = mapped_column(
        ForeignKey('masters.id', ondelete='CASCADE')
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey('services.id', ondelete='CASCADE')
    )
    price: Mapped[int]
    duration: Mapped[time]

    # Отношения с другими ORM
    master: Mapped['Master'] = relationship(back_populates='offerings')
    service: Mapped['Service'] = relationship(back_populates='offerings')


class Occupation(Base):
    __tablename__ = 'occupations'

    id: Mapped[int_pk]
    master_id: Mapped[int] = mapped_column(
        ForeignKey('masters.id', ondelete='CASCADE')
    )
    start: Mapped[datetime]
    end: Mapped[datetime]


class Appointment(Base):
    __tablename__ = 'appointments'

    # Основные поля в таблице
    id: Mapped[int_pk]
    name: Mapped[str] = mapped_column(String(100))
    customer_id: Mapped[int] = mapped_column(
        ForeignKey('customers.id', ondelete='SET NULL'), nullable=True
    )
    offering_id: Mapped[int] = mapped_column(
        ForeignKey('offerings.id', ondelete='SET NULL'), nullable=True
    )
    occupation_id: Mapped[int] = mapped_column(
        ForeignKey('occupations.id', ondelete='SET NULL'), nullable=True
    )
    confirmed: Mapped[bool] = mapped_column(default=False)
    secret_code: Mapped[str] = mapped_column(String(8))
    attempts: Mapped[int] = mapped_column(default=5)
    created_at: Mapped[creation_time]

    # Отношения с другими ORM
    customer: Mapped['Customer'] = relationship()
    offering: Mapped['Offering'] = relationship()
    slot: Mapped['Occupation'] = relationship()

    @hybrid_property
    def phone(self) -> str:
        return self.customer.phone


class Transaction(Base):
    __tablename__ = 'transactions'

    id: Mapped[int_pk]
    # Service details (optional)
    offering_id: Mapped[int | None] = mapped_column(
        ForeignKey('offerings.id', ondelete='SET NULL'), nullable=True
    )
    # Product details (optional)
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey('products.id', ondelete='SET NULL'), nullable=True
    )
    product_quantity_used: Mapped[int | None]  # Quantity of product used in ml or pieces
    # Overtime amount (optional)
    overtime_amount: Mapped[int | None]  # Amount in som
    # Total transaction amount (calculated)
    total_amount: Mapped[int]  # Amount in som (adjusted for product costs)
    # Transaction type (income, expense, or collection)
    transaction_type: Mapped[str] = mapped_column(String(20))  # 'income', 'expense', or 'collection'
    # Date of transaction
    transaction_date: Mapped[date]
    # Creation timestamp
    created_at: Mapped[creation_time]

    # Relationships
    offering: Mapped['Offering'] = relationship()
    product: Mapped['Product'] = relationship()

from fastapi import APIRouter, status, Body, Depends, Path, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional
from datetime import date, datetime

from core.auth import verify_token
from core.schemas import TransactionCreate, TransactionDB, CashSummary
from db.models import Transaction, Offering, Product
from db.postgresql import get_session
from db.queries import select_one, insert_one

basic_router = APIRouter(prefix='/cash-register')


@basic_router.post(
    '/transactions/',
    response_model=TransactionDB,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)]
)
async def create_transaction(
    session: Annotated[AsyncSession, Depends(get_session)],
    transaction: Annotated[TransactionCreate, Body()]
):
    """Создание новой транзакции в кассе"""
    # Validate that at least one of the required fields is provided
    if not any([transaction.offering_id, transaction.product_id, transaction.overtime_amount]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='At least one of offering_id, product_id, or overtime_amount must be provided'
        )
    
    # Validate offering exists if provided
    if transaction.offering_id:
        offering = await select_one(session, Offering, {'id': transaction.offering_id})
        if offering is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Offering with such id doesn\'t exist'
            )
    
    # Validate product exists if provided
    if transaction.product_id:
        product = await select_one(session, Product, {'id': transaction.product_id})
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Product with such id doesn\'t exist'
            )
        
        # Check if product has enough quantity
        if transaction.product_quantity_used and product.quantity < transaction.product_quantity_used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'Not enough product quantity. Available: {product.quantity}, Requested: {transaction.product_quantity_used}'
            )
        
        # Deduct product quantity if used
        if transaction.product_quantity_used:
            product.quantity -= transaction.product_quantity_used
            session.add(product)
    
    # Create the transaction
    new_transaction = Transaction(
        offering_id=transaction.offering_id,
        product_id=transaction.product_id,
        product_quantity_used=transaction.product_quantity_used,
        overtime_amount=transaction.overtime_amount,
        total_amount=transaction.total_amount,
        transaction_type=transaction.transaction_type,
        transaction_date=transaction.transaction_date
    )
    
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    
    return TransactionDB.model_validate(new_transaction, from_attributes=True)


@basic_router.get(
    '/transactions/',
    response_model=List[TransactionDB],
    dependencies=[Depends(verify_token)]
)
async def get_transactions(
    session: Annotated[AsyncSession, Depends(get_session)],
    start_date: Annotated[date, Query()] = None,
    end_date: Annotated[date, Query()] = None,
    transaction_type: Annotated[str, Query()] = None
):
    """Получение истории транзакций с возможностью фильтрации по дате и типу"""
    query = select(Transaction)
    
    # Apply date filters
    if start_date:
        query = query.where(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.where(Transaction.transaction_date <= end_date)
    if transaction_type:
        query = query.where(Transaction.transaction_type == transaction_type)
    
    query = query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    
    result = await session.execute(query)
    transactions = result.scalars().all()
    
    return [TransactionDB.model_validate(t, from_attributes=True) for t in transactions]


@basic_router.get(
    '/summary/',
    response_model=CashSummary,
    dependencies=[Depends(verify_token)]
)
async def get_cash_summary(
    session: Annotated[AsyncSession, Depends(get_session)],
    summary_date: Annotated[date, Query()] = None
):
    """Получение сводной информации о кассе за день"""
    if summary_date is None:
        summary_date = date.today()
    
    # Calculate income for the date
    income_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
        and_(
            Transaction.transaction_date == summary_date,
            Transaction.transaction_type == 'income'
        )
    )
    
    income_result = await session.execute(income_query)
    income = income_result.scalar() or 0
    
    # Calculate expenses for the date
    expense_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
        and_(
            Transaction.transaction_date == summary_date,
            Transaction.transaction_type == 'expense'
        )
    )
    
    expense_result = await session.execute(expense_query)
    expenses = expense_result.scalar() or 0
    
    # Calculate balance
    balance = income - expenses
    
    return CashSummary(
        date=summary_date,
        income=income,
        expenses=expenses,
        balance=balance
    )


@basic_router.get(
    '/summary-range/',
    response_model=List[CashSummary],
    dependencies=[Depends(verify_token)]
)
async def get_cash_summary_range(
    session: Annotated[AsyncSession, Depends(get_session)],
    start_date: Annotated[date, Query()],
    end_date: Annotated[date, Query()]
):
    """Получение сводной информации о кассе за период"""
    # Get all dates in the range
    date_range_query = select(Transaction.transaction_date).where(
        and_(
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date
        )
    ).distinct().order_by(Transaction.transaction_date)
    
    date_result = await session.execute(date_range_query)
    dates = [row[0] for row in date_result.fetchall()]
    
    summaries = []
    for summary_date in dates:
        # Calculate income for the date
        income_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
            and_(
                Transaction.transaction_date == summary_date,
                Transaction.transaction_type == 'income'
            )
        )
        
        income_result = await session.execute(income_query)
        income = income_result.scalar() or 0
        
        # Calculate expenses for the date
        expense_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
            and_(
                Transaction.transaction_date == summary_date,
                Transaction.transaction_type == 'expense'
            )
        )
        
        expense_result = await session.execute(expense_query)
        expenses = expense_result.scalar() or 0
        
        # Calculate balance
        balance = income - expenses
        
        summaries.append(CashSummary(
            date=summary_date,
            income=income,
            expenses=expenses,
            balance=balance
        ))
    
    return summaries


@basic_router.post(
    '/withdraw/',
    response_model=TransactionDB,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)]
)
async def withdraw_money(
    session: Annotated[AsyncSession, Depends(get_session)],
    amount: Annotated[int, Body()],
    transaction_date: Annotated[date, Body()] = None
):
    """Снятие денег из кассы (расход)"""
    if transaction_date is None:
        transaction_date = date.today()
    
    # Create expense transaction
    new_transaction = Transaction(
        total_amount=amount,
        transaction_type='expense',
        transaction_date=transaction_date
    )
    
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    
    return TransactionDB.model_validate(new_transaction, from_attributes=True)


@basic_router.post(
    '/deposit/',
    response_model=TransactionDB,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)]
)
async def deposit_money(
    session: Annotated[AsyncSession, Depends(get_session)],
    amount: Annotated[int, Body()],
    transaction_date: Annotated[date, Body()] = None
):
    """Добавление денег в кассу (доход)"""
    if transaction_date is None:
        transaction_date = date.today()
    
    # Create income transaction
    new_transaction = Transaction(
        total_amount=amount,
        transaction_type='income',
        transaction_date=transaction_date
    )
    
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    
    return TransactionDB.model_validate(new_transaction, from_attributes=True)
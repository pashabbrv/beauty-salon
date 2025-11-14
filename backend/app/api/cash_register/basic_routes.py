from fastapi import APIRouter, status, Body, Depends, Path, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional
from datetime import date, datetime, timedelta
import json

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
    
    # Initialize total_amount
    total_amount = transaction.total_amount
    
    # Validate offering exists if provided
    offering = None
    offering_cost = 0
    if transaction.offering_id:
        offering = await select_one(session, Offering, {'id': transaction.offering_id})
        if offering is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Offering with such id doesn\'t exist'
            )
        offering_cost = offering.price
    
    # Validate product exists if provided
    product = None
    product_cost = 0
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
            
            # Calculate product cost
            if product.price and transaction.product_quantity_used:
                product_cost = product.price * transaction.product_quantity_used
    
    # If total_amount is 0 or negative, calculate it automatically
    if total_amount <= 0:
        total_amount = offering_cost + product_cost + (transaction.overtime_amount or 0)
    
    # Ensure total_amount is not negative for income transactions
    if transaction.transaction_type == 'income' and total_amount < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Transaction amount cannot be negative. Calculated amount: {total_amount}'
        )
    
    # Create the transaction with calculated or provided total amount
    new_transaction = Transaction(
        offering_id=transaction.offering_id,
        product_id=transaction.product_id,
        product_quantity_used=transaction.product_quantity_used,
        overtime_amount=transaction.overtime_amount,
        total_amount=max(0, total_amount),  # Ensure non-negative value
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
    
    # Calculate income for the date (only 'income' type transactions)
    income_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
        and_(
            Transaction.transaction_date == summary_date,
            Transaction.transaction_type == 'income'
        )
    )
    
    income_result = await session.execute(income_query)
    income = income_result.scalar() or 0
    
    # Calculate expenses for the date (only 'expense' type transactions, not collections)
    expense_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
        and_(
            Transaction.transaction_date == summary_date,
            Transaction.transaction_type == 'expense'
        )
    )
    
    expense_result = await session.execute(expense_query)
    expenses = expense_result.scalar() or 0
    
    # Calculate balance (income - expenses - collections)
    # First get collections for the date
    collection_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
        and_(
            Transaction.transaction_date == summary_date,
            Transaction.transaction_type == 'collection'
        )
    )
    
    collection_result = await session.execute(collection_query)
    collections = collection_result.scalar() or 0
    
    # Balance is income minus expenses minus collections
    balance = income - expenses - collections
    
    return CashSummary(
        date=summary_date,
        income=int(income),
        expenses=int(expenses),
        balance=int(balance)
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
    # Validate date range
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Start date must be before or equal to end date'
        )
    
    # Generate all dates in the range
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date)
        # Move to next day
        current_date = date.fromordinal(current_date.toordinal() + 1)
    
    summaries = []
    for summary_date in date_range:
        # Calculate income for the date (only 'income' type transactions)
        income_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
            and_(
                Transaction.transaction_date == summary_date,
                Transaction.transaction_type == 'income'
            )
        )
        
        income_result = await session.execute(income_query)
        income = income_result.scalar() or 0
        
        # Calculate expenses for the date (only 'expense' type transactions, not collections)
        expense_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
            and_(
                Transaction.transaction_date == summary_date,
                Transaction.transaction_type == 'expense'
            )
        )
        
        expense_result = await session.execute(expense_query)
        expenses = expense_result.scalar() or 0
        
        # Calculate collections for the date (only 'collection' type transactions)
        collection_query = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
            and_(
                Transaction.transaction_date == summary_date,
                Transaction.transaction_type == 'collection'
            )
        )
        
        collection_result = await session.execute(collection_query)
        collections = collection_result.scalar() or 0
        
        # Balance is income minus expenses minus collections
        balance = income - expenses - collections
        
        summaries.append(CashSummary(
            date=summary_date,
            income=int(income),
            expenses=int(expenses),
            balance=int(balance)
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
    transaction_date: Annotated[str, Body()] = None
):
    """Снятие денег из кассы (расход)"""
    print(f"WITHDRAW: Received request with amount={amount}, transaction_date={transaction_date}")
    
    # Parse the date if provided
    if transaction_date:
        try:
            parsed_date = date.fromisoformat(transaction_date)
            print(f"WITHDRAW: Parsed date successfully: {parsed_date}")
        except (ValueError, TypeError) as e:
            print(f"WITHDRAW: Error parsing date: {e}")
            parsed_date = date.today()
    else:
        parsed_date = date.today()
        print(f"WITHDRAW: Using today's date: {parsed_date}")
    
    # Create expense transaction
    new_transaction = Transaction(
        total_amount=amount,
        transaction_type='expense',
        transaction_date=parsed_date
    )
    
    print(f"WITHDRAW: Creating transaction with amount={amount}, type=expense, date={parsed_date}")
    
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    
    print(f"WITHDRAW: Transaction created successfully with ID={new_transaction.id}")
    
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
    transaction_date: Annotated[str, Body()] = None
):
    """Добавление денег в кассу (доход)"""
    print(f"DEPOSIT: Received request with amount={amount}, transaction_date={transaction_date}")
    
    # Parse the date if provided
    if transaction_date:
        try:
            parsed_date = date.fromisoformat(transaction_date)
            print(f"DEPOSIT: Parsed date successfully: {parsed_date}")
        except (ValueError, TypeError) as e:
            print(f"DEPOSIT: Error parsing date: {e}")
            parsed_date = date.today()
    else:
        parsed_date = date.today()
        print(f"DEPOSIT: Using today's date: {parsed_date}")
    
    # Create income transaction
    new_transaction = Transaction(
        total_amount=amount,
        transaction_type='income',
        transaction_date=parsed_date
    )
    
    print(f"DEPOSIT: Creating transaction with amount={amount}, type=income, date={parsed_date}")
    
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    
    print(f"DEPOSIT: Transaction created successfully with ID={new_transaction.id}")
    
    return TransactionDB.model_validate(new_transaction, from_attributes=True)


@basic_router.post(
    '/collect/',
    response_model=TransactionDB,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)]
)
async def collect_money(
    session: Annotated[AsyncSession, Depends(get_session)],
    amount: Annotated[int, Body()],
    transaction_date: Annotated[str, Body()] = None,
    notes: Annotated[str, Body()] = None
):
    """Инкассация - изъятие денег из кассы без учета как расхода"""
    print(f"COLLECT: Received request with amount={amount}, transaction_date={transaction_date}, notes={notes}")
    
    # Parse the date if provided
    if transaction_date:
        try:
            parsed_date = date.fromisoformat(transaction_date)
            print(f"COLLECT: Parsed date successfully: {parsed_date}")
        except (ValueError, TypeError) as e:
            print(f"COLLECT: Error parsing date: {e}")
            parsed_date = date.today()
    else:
        parsed_date = date.today()
        print(f"COLLECT: Using today's date: {parsed_date}")
    
    # Create collection transaction (expense type but with special notes)
    new_transaction = Transaction(
        total_amount=amount,
        transaction_type='collection',  # Special type for collections
        transaction_date=parsed_date
    )
    
    print(f"COLLECT: Creating transaction with amount={amount}, type=collection, date={parsed_date}")
    
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    
    print(f"COLLECT: Transaction created successfully with ID={new_transaction.id}")
    
    return TransactionDB.model_validate(new_transaction, from_attributes=True)

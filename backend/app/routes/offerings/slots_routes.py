from datetime import date, datetime, time, timedelta
from fastapi import APIRouter, status, Path, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from db.models import Offering, Occupation
from db.postgresql import get_session
from db.queries import select_one


START_HOURS = 9
START_MINUTES = 0
END_HOURS = 21
END_MINUTES = 0
SLOTS_DAYS = 14
INTERVAL_MINUTES = 30

slots_router = APIRouter()


def generate_time_slots(duration_h: int, duration_m: int) -> list[datetime]:
    """Генерация всех слотов для мастера, начиная с текущего времени."""
    time_slots = []
    today = date.today()
    now = datetime.now()  # Текущие дата и время
    
    for day in range(SLOTS_DAYS):
        current_date = today + timedelta(days=day)
        
        # Начальное время для дня (но не раньше текущего момента)
        day_start = datetime.combine(current_date, time(START_HOURS, START_MINUTES))
        if day == 0:
            current_minute = now.minute
            rounded_minute = (current_minute // INTERVAL_MINUTES) * INTERVAL_MINUTES
            now = now.replace(minute=rounded_minute, second=0, microsecond=0)
            day_start = max(day_start, now)
        
        # Конечное время с учётом длительности услуги
        day_end = datetime.combine(
            current_date,
            time(END_HOURS, END_MINUTES)
        ) - timedelta(hours=duration_h, minutes=duration_m)
        
        # Генерация слотов
        current_slot = day_start
        while current_slot <= day_end:
            time_slots.append(current_slot)
            current_slot += timedelta(minutes=INTERVAL_MINUTES)
    
    return time_slots


def filter_busy_slots(
    slots: list[datetime],
    busy_intervals: list[tuple[datetime, datetime]]
) -> list[datetime]:
    """Удаление слотов в зависимости от занятости мастера"""
    filtered_slots = []
    
    for slot in slots:
        is_busy = False
        for busy_start, busy_end in busy_intervals:
            # Проверяем, попадает ли slot в занятый интервал
            if busy_start <= slot < busy_end:
                is_busy = True
                break  # Достаточно одного пересечения
        if not is_busy:
            filtered_slots.append(slot)
    
    return filtered_slots


@slots_router.get(
    '/{offering_id}/slots/',
    response_model=list[datetime]
)
async def get_free_time_for_two_weeks(
    session: Annotated[AsyncSession, Depends(get_session)],
    offering_id: Annotated[int, Path()]
):
    """Получение всех ячеек записи на определённое время вперёд"""
    # Получаем услугу мастера из БД
    offering = await select_one(session, Offering, {'id': offering_id})
    if offering is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Offering with such id doesn\'t exist'
        )
    # Генерируем слоты для записи без учёта занятости мастера
    slots = generate_time_slots(
        offering.duration.hour,
        offering.duration.minute
    )
    # Получаем из БД всё несвободное время мастера
    result = await session.execute(
        select(Occupation).where(Occupation.master_id == offering.master_id)
    )
    occupations = result.scalars().all()
    busy_intervals = [(el.start, el.end) for el in occupations]
    # Фильтруем слоты и получаем все свободные
    free_slots = filter_busy_slots(slots, busy_intervals)

    return free_slots

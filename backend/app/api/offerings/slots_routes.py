from datetime import datetime
from fastapi import APIRouter, status, Path, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from ...db.models import Offering, Occupation
from ...db.postgresql import get_session
from ...db.queries import select_one
from .utils import generate_time_slots_for_now, filter_busy_slots


slots_router = APIRouter()


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
    slots = generate_time_slots_for_now(
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
    free_slots = filter_busy_slots(
        slots,
        busy_intervals,
        offering.duration.hour,
        offering.duration.minute
    )

    return free_slots

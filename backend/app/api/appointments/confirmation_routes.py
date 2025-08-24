from fastapi import APIRouter, status, Body, Path, Depends, HTTPException
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import OKModel, ConfirmationCode
from db.models import Appointment
from db.postgresql import get_session
from db.queries import select_one


confirmation_router = APIRouter()


@confirmation_router.post(
    '/{appointment_id}/refresh/',
    response_model=ConfirmationCode
)
async def refresh_confirmation_code(
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment_id: Annotated[int, Path()]
):
    result = await select_one(session, Appointment, {'id': appointment_id})
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Appointment with such id doesn\'t exist'
        )
    return {'confirmation_code': result.secret_code}


@confirmation_router.post(
    '/{appointment_id}/confirm/',
    response_model=OKModel
)
async def refresh_confirmation_code(
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment_id: Annotated[int, Path()],
    confirmation_code: Annotated[ConfirmationCode, Body()]
):
    appointment = await select_one(session, Appointment, {'id': appointment_id})
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Appointment with such id doesn\'t exist'
        )
    if appointment.confirmed:
        return {'message': 'OK'}
    if appointment.secret_code != confirmation_code.confirmation_code:
        appointment.attempts -= 1
        msg = 'Confirmation code incorrect'
        if appointment.attempts <= 0:
            await session.delete(appointment)
            msg = 'Confirmation code incorrect. Appointment was deleted'
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
    result = await session.execute(
        update(Appointment)
        .where(Appointment.id == appointment_id)
        .values(confirmed=True)
    )
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Something went wrong'
        )
    await session.commit()
    return {'message': 'OK'}


@confirmation_router.post(
    '/{appointment_id}/admin_confirm/',
    response_model=OKModel
)
async def confirm_appointment(
    _: Annotated[None, Depends(verify_token)], # Верификация по токену
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment_id: Annotated[int, Path()]
):
    """Подтверждение записи по её id"""
    result = await session.execute(
        update(Appointment)
        .values(confirmed=True)
        .where(Appointment.id == appointment_id)
    )
    # Если записей с таким id не существовало
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Appointment with such id doesn\'t exist'
        )
    await session.commit()
    return {'message': 'OK'}

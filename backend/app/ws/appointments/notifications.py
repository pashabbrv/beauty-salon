from asyncio import CancelledError
from fastapi import (
    APIRouter, Depends, WebSocket, status, WebSocketDisconnect
)
from typing import Annotated

from app.core.auth import verify_token_bool
from ..connection_manager import ConnectionManager


notifications_router = APIRouter()
ws_appointments_manager = ConnectionManager()


@notifications_router.websocket('/notifications/')
async def notifications_subscription(
    access_check: Annotated[bool, Depends(verify_token_bool)],
    websocket: WebSocket
):
    """WebSocket для отслеживания новых клиентов"""
    if not access_check:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason='Invalid token'
        )
        return

    try:
        await ws_appointments_manager.connect(websocket)
        while True:
            data = await websocket.receive()
    except (WebSocketDisconnect, CancelledError):
        pass
    except Exception:
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except:
            pass
    finally:
        ws_appointments_manager.disconnect(websocket)

from typing import Callable
import asyncio
import json
import logging
import websockets

from ..config import BACKEND_WS_URL, AUTH_BACKEND_TOKEN
from ..utils.phone import simple_phone_to_id


# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ServerNotifications:
    def __init__(self, send_message_to_user: Callable):
        self.websocket_connected = False
        self.send_message_to_user = send_message_to_user


    async def handle_websocket_message(self, message_data: str):
        """Обработка сообщений от WebSocket сервера"""
        try:
            logger.info(f'Получено WebSocket сообщение: {message_data}')
            data = json.loads(message_data)
            message = data.get('message')
            detail = data.get('detail')
            # --- Уведомление подтверждения записи ---
            if message == 'confirmation' and detail is not None:
                phone = detail['phone']
                code = detail['code']
                whatsapp_id = simple_phone_to_id(phone)
                logger.info(f'Отправка кода подтверждения: {phone} -> {whatsapp_id}, код: {code}')
                self.send_message_to_user(
                    whatsapp_id,
                    f"Код подтверждения записи: {code}"
                )
            else:
                logger.info('Некорректная структура JSON')
        except json.JSONDecodeError:
            logger.info('Ошибка декодирования JSON из WebSocket')
        except Exception as e:
            logger.info(f'Ошибка обработки WebSocket сообщения: {e}')


    async def notifications_listener(self):
        """Постоянное соединение с WebSocket сервером"""
        uri = BACKEND_WS_URL + '/ws/appointments/notifications/'
        headers = {
            'Auth-Token': AUTH_BACKEND_TOKEN
        }
        
        while True:
            try:
                async with websockets.connect(uri, additional_headers=headers) as websocket:
                    self.websocket_connected = True
                    logger.info('WebSocket соединение установлено')
                    
                    while True:
                        try:
                            message = await websocket.recv()
                            await self.handle_websocket_message(message)
                        except websockets.exceptions.ConnectionClosed:
                            logger.info('WebSocket соединение закрыто, переподключаемся...')
                            self.websocket_connected = False
                            break
                        except Exception as e:
                            logger.info(f'Ошибка при получении сообщения: {e}')
                            self.websocket_connected = False
                            break
                            
            except Exception as e:
                self.websocket_connected = False
                logger.info(f'Ошибка подключения к WebSocket: {e}')
                logger.info('Повторная попытка подключения через 5 секунд...')
                await asyncio.sleep(5)

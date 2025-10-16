import logging
from fastapi import WebSocket, WebSocketDisconnect


# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        """Инициализация с созданием списка подключений"""
        self.active_connections: list[WebSocket] = []


    async def connect(self, websocket: WebSocket) -> None:
        """Установление соединения с новым подключением"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")


    def disconnect(self, websocket: WebSocket) -> None:
        """Разрыв соединения с определённым подключением"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")


    async def broadcast(self, message: dict) -> bool:
        """Отправка сообщения всем подключенным клиентам. Если сообщение не 
        доставлено никому, то возвращаемое значение будет False, иначе - True
        """
        if not self.active_connections:
            return False

        disconnected_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except (WebSocketDisconnect, RuntimeError):
                disconnected_connections.append(connection)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected_connections.append(connection)
        
        result = self.active_connections != disconnected_connections

        # Удаляем отключенные соединения
        for connection in disconnected_connections:
            self.disconnect(connection)
        return result


ws_appointments_manager = ConnectionManager()

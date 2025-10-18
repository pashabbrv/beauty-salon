import logging
import asyncio
import json
from faststream.rabbit import RabbitBroker

from .config import RMQ_URL
from .greenapi import send_whatsapp_message


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


broker = RabbitBroker(RMQ_URL, max_consumers=1)


@broker.subscriber('whatsapp_notifications')
async def handle_audio(data: str):
    try:
        body = json.loads(data)
        # Считываем поля JSON, начинаем обработку
        message = body['message']
        detail  = body['detail']
        
        if message == 'confirmation':
            phone = detail['phone']
            code  = detail['code']
            logger.info(f"Sending confirmation code {code} to {phone}")
            result = send_whatsapp_message(phone, f"Ваш код подтверждения: {code}")
            if result:
                logger.info(f"Successfully sent confirmation code to {phone}")
            else:
                logger.error(f"Failed to send confirmation code to {phone}")
    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)
        return


async def main():
    async with broker:
        await broker.start()
        while True:
            await asyncio.sleep(3600)


if __name__ == '__main__':
    asyncio.run(main())
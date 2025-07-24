# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ожидаем, что переменные окружения ULTRA_INSTANCE_ID и ULTRA_TOKEN будут переданы при запуске контейнера
CMD ["python", "bot.py"] 
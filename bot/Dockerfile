FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем ВНУТРЕННЮЮ папку bot (где код)
COPY bot ./bot

CMD ["python", "-m", "bot.bot"]

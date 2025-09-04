FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the bot package and storage
COPY bot ./bot
COPY bot_storage.db ./bot_storage.db

# Run the bot
CMD ["python", "-m", "bot.bot"]

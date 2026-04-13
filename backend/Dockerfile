FROM python:3.10-slim

WORKDIR /app

# Copy requirements from root directory context or backend
# We will assume docker context is backend for this file, so copy requirements inside backend if needed.
# Since originally requirements was at root, I'll allow docker-compose to use root context or just copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app
COPY app ./app

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

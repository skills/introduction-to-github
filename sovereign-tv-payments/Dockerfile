# Sovereign TV Payments Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5002

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=5002

# Run with gunicorn
CMD ["gunicorn", "--workers", "2", "--threads", "4", "--worker-class", "gthread", "--bind", "0.0.0.0:5002", "app:app"]

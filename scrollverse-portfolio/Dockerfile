# ScrollVerse Portfolio Dockerfile
# Multi-stage build for production deployment with Flask-SocketIO

# Stage 1: Build stage
FROM python:3.11-slim AS builder

WORKDIR /build

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production stage
FROM python:3.11-slim

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /root/.local /root/.local

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Remove unnecessary files for smaller image
RUN rm -rf __pycache__ *.pyc .env.example

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')" || exit 1

# Run with gunicorn using eventlet worker for SocketIO support
CMD ["gunicorn", "--worker-class", "eventlet", "--workers", "1", "--bind", "0.0.0.0:5000", "app:app"]

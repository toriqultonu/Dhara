FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml ./
RUN uv pip install --system --no-cache-dir .

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
EXPOSE 8000 50051
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

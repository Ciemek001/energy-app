# backend/Dockerfile

# Używamy Pythona 3.10 (wersja slim jest lżejsza)
FROM python:3.10-slim

# Ustawiamy katalog roboczy
WORKDIR /app

# Instalujemy zależności systemowe potrzebne do kompilacji psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Kopiujemy requirements.txt
COPY requirements.txt .

# Instalujemy zależności Python
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy resztę kodu backendu
COPY . .

# Uruchamiamy aplikację
# --host 0.0.0.0 sprawia, że serwer jest dostępny poza kontenerem
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
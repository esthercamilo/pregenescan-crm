#!/bin/sh

# Supondo que você ainda queira esperar pelo banco de dados antes de iniciar
# (Isso só é útil se o banco de dados for novo ou instável)
DB_HOST="${PGHOST}" # Usa a variável de ambiente ou 'db' como fallback
DB_PORT="5432"

echo "Waiting for $PGHOST to be ready..."
while ! nc -z $PGHOST 5432; do
  sleep 0.1
done
echo "Database is reachable."

# Coleta os estáticos (ainda é necessário para o Gunicorn)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Inicia o Gunicorn (Executa o comando principal do docker-compose)
exec "$@"
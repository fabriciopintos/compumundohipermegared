#!/bin/bash
set -e

echo "FitPower: iniciando..."

if ! php /var/www/html/api/database/migrate.php; then
  echo "AVISO: migrate.php fallo; se inicia Apache igual."
fi

exec apache2-foreground
#!/bin/bash
set -e
php /var/www/html/api/database/migrate.php
exec apache2-foreground

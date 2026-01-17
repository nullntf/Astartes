#!/bin/sh
set -e

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Run seeders
php artisan db:seed --force

# Start PHP built-in server on Railway's PORT
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}

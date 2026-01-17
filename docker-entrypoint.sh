#!/bin/sh
set -e

# Clear any existing cache first
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

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
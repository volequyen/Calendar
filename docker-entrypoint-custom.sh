#!/bin/bash
set -e

# Đợi MySQL khởi động
echo "Waiting for MySQL to start..."
until mysqladmin ping -h"mysql" -u"root" -p"huyho2004" --silent; do
    sleep 1
done

echo "MySQL started, initializing database..."
mysql -h mysql -u root -p"huyho2004" < /init.sql

echo "Database initialization completed"

# Chạy lệnh mặc định
exec "$@"
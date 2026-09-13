#!/bin/bash
# Redespliegue en el VPS (Hetzner). Uso: ./deploy.sh, corrido en /opt/app.
set -e
cd /opt/app
git pull
cd app && npm install --silent && npm run build
cd ../server && npm install --silent && npx prisma migrate deploy && npx prisma generate
systemctl restart descargoycargo-api
echo 'Desplegado correctamente'

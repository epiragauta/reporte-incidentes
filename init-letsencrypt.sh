#!/bin/bash

# ------------------------------------------------------------------
# Script de inicialización de certificados SSL con Let's Encrypt
#
# Resuelve el problema de arranque circular:
#   Nginx necesita certificados para iniciar el bloque SSL,
#   pero Certbot necesita Nginx corriendo para el challenge HTTP.
#
# Solución: genera un certificado temporal auto-firmado, arranca
# Nginx, obtiene el certificado real con Certbot, y reinicia Nginx.
#
# Uso:
#   chmod +x init-letsencrypt.sh
#   ./init-letsencrypt.sh
#
# Solo es necesario ejecutar este script UNA VEZ en el servidor.
# Las renovaciones posteriores son automáticas vía el contenedor
# de Certbot.
# ------------------------------------------------------------------

set -e

DOMAIN="incidencias.skaphe.com"
EMAIL="${CERTBOT_EMAIL:-}"
STAGING=${STAGING:-0}  # Set to 1 for testing to avoid rate limits

CERT_PATH="./certbot/conf/live/$DOMAIN"

# Check if certificates already exist
if [ -d "$CERT_PATH" ] && [ -f "$CERT_PATH/fullchain.pem" ]; then
    echo ">> Los certificados para $DOMAIN ya existen."
    echo ">> Si deseas renovar, ejecuta: docker compose run --rm certbot renew"
    exit 0
fi

echo ">> Creando directorios necesarios..."
mkdir -p "./certbot/conf/live/$DOMAIN"
mkdir -p "./certbot/www"

echo ">> Generando certificado temporal auto-firmado para $DOMAIN..."
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$CERT_PATH/privkey.pem" \
    -out "$CERT_PATH/fullchain.pem" \
    -subj "/CN=$DOMAIN" 2>/dev/null

echo ">> Arrancando Nginx con certificado temporal..."
docker compose up -d nginx

echo ">> Esperando a que Nginx esté listo..."
sleep 5

echo ">> Eliminando certificado temporal..."
rm -rf "$CERT_PATH"

echo ">> Solicitando certificado real a Let's Encrypt..."

# Build certbot command
CERTBOT_CMD="certonly --webroot -w /var/www/certbot"
CERTBOT_CMD="$CERTBOT_CMD -d $DOMAIN"
CERTBOT_CMD="$CERTBOT_CMD --non-interactive --agree-tos"

if [ -n "$EMAIL" ]; then
    CERTBOT_CMD="$CERTBOT_CMD --email $EMAIL"
else
    CERTBOT_CMD="$CERTBOT_CMD --register-unsafely-without-email"
    echo ">> AVISO: No se proporcionó email. Usa CERTBOT_EMAIL=tu@email.com para recibir avisos de expiración."
fi

# Use staging server for testing
if [ "$STAGING" = "1" ]; then
    CERTBOT_CMD="$CERTBOT_CMD --staging"
    echo ">> Usando servidor de staging (certificado de prueba)."
fi

docker compose run --rm certbot $CERTBOT_CMD

echo ">> Reiniciando Nginx con el certificado real..."
docker compose exec nginx nginx -s reload

echo ""
echo ">> ¡Listo! Certificado SSL configurado para https://$DOMAIN"
echo ">> La renovación automática está configurada en el contenedor de Certbot."

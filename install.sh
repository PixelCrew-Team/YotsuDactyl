#!/bin/bash

AZUL_B="\e[1;34m"
CYAN_B="\e[1;36m"
VERDE="\e[0;32m"
ROJO="\e[0;31m"
RESET="\e[0m"

clear
echo -e "${CYAN_B}╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮${RESET}"
echo -e "${CYAN_B}┃      YOTSUDACTYL - INSTALLER v1.1    ┃${RESET}"
echo -e "${CYAN_B}╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯${RESET}"

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates gnupg lsb-release nginx certbot python3-certbot-nginx postgresql postgresql-contrib

if ! [ -x "$(command -v docker)" ]; then
    echo -e "${AZUL_B}┃${RESET} Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

echo -e "${AZUL_B}┃${RESET} Instalando Node.js y PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

echo -e "${AZUL_B}┃${RESET} Configurando Firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
echo "y" | sudo ufw enable

sudo chmod -R 775 $(pwd)
sudo chown -R $USER:$USER $(pwd)
sudo mkdir -p /var/lib/yotsudactyl/volumes
sudo chmod -R 777 /var/lib/yotsudactyl

echo -e "${AZUL_B}┃${RESET} Configurando Base de Datos..."
sudo -u postgres psql -c "CREATE DATABASE yotsudactyl;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'yotsu_pass';"
sudo -u postgres psql -d yotsudactyl -f database.sql

# GENERACIÓN AUTOMÁTICA DEL .ENV PARA EVITAR ERRORES DE SASL
echo "DB_USER=postgres
DB_HOST=localhost
DB_NAME=yotsudactyl
DB_PASSWORD=yotsu_pass
DB_PORT=5432" > .env

echo -e "${AZUL_B}┃${RESET} Instalando Dependencias..."
npm install

echo -e "\n${CYAN_B}╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮${RESET}"
echo -e "${CYAN_B}┃      CONFIGURACIÓN DE DOMINIO        ┃${RESET}"
echo -e "${CYAN_B}╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯${RESET}"
read -p "┃ Dominio: " DOMAIN

cat <<EOF | sudo tee /etc/nginx/sites-available/yotsudactyl
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/yotsudactyl /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo -e "${CYAN_B}┃${RESET} ¿Activar SSL con Certbot? (s/n)"
read SSL_CHOICE
if [ "$SSL_CHOICE" = "s" ]; then
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m frasesbebor@gmail.com
fi

echo -e "\n${VERDE}╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮${RESET}"
echo -e "${VERDE}┃   INSTALACIÓN COMPLETADA CON ÉXITO   ┃${RESET}"
echo -e "${VERDE}╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯${RESET}"
echo -e "${AZUL_B}┃${RESET} Dominio: https://$DOMAIN"
echo -e "${AZUL_B}┃${RESET} 1. Crea tu admin: node src/createAdmin.js"
echo -e "${AZUL_B}┃${RESET} 2. Inicia el panel: npm start"
echo -e "${VERDE}╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯${RESET}"
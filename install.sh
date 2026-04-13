#!/bin/bash
# YOTSUDACTYL - INSTALLER ULTIMATE

AZUL_B="\e[1;34m"
CYAN_B="\e[1;36m"
VERDE="\e[0;32m"
ROJO="\e[0;31m"
RESET="\e[0m"

clear
echo -e "${AZUL_B}########################################${RESET}"
echo -e "${CYAN_B}      YOTSUDACTYL - INSTALLER          ${RESET}"
echo -e "${AZUL_B}########################################${RESET}"

echo -e "\n${AZUL_B}[>]${RESET} Actualizando sistema e instalando Docker..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates gnupg lsb-release

if ! [ -x "$(command -v docker)" ]; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

echo -e "\n${AZUL_B}[>]${RESET} Instalando Node.js, Postgres y PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib
sudo npm install -g pm2

echo -e "\n${AZUL_B}[>]${RESET} Configurando permisos de carpetas..."
# Esto arregla el error de "Permission Denied" para Postgres y Node
sudo chmod -R 775 $(pwd)
sudo chown -R $USER:$USER $(pwd)
sudo mkdir -p /var/lib/yotsudactyl/volumes
sudo chmod -R 777 /var/lib/yotsudactyl

echo -e "\n${AZUL_B}[>]${RESET} Configurando Base de Datos..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS yotsudactyl;"
sudo -u postgres psql -c "CREATE DATABASE yotsudactyl;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'yotsu_pass';"
sudo -u postgres psql -d yotsudactyl -f database.sql

echo -e "\n${AZUL_B}[>]${RESET} Insertando Egg predeterminado..."
sudo -u postgres psql -d yotsudactyl -c "INSERT INTO eggs (name, docker_image, startup_command) VALUES ('Node.js 20 (Default)', 'node:20-slim', 'npm start');"

echo -e "\n${AZUL_B}[>]${RESET} Instalando dependencias del proyecto..."
npm install

echo -e "\n${VERDE}########################################${RESET}"
echo -e "${VERDE}   INSTALACIÓN COMPLETADA CON ÉXITO    ${RESET}"
echo -e "${VERDE}   1. Crea tu admin: node src/createAdmin.js ${RESET}"
echo -e "${VERDE}   2. Inicia el panel: npm start       ${RESET}"
echo -e "${VERDE}########################################${RESET}"
#!/bin/bash
# YOTSUDACTYL - INSTALLER PRO

AZUL_B="\e[1;34m"
CYAN_B="\e[1;36m"
VERDE="\e[0;32m"
ROJO="\e[0;31m"
RESET="\e[0m"

clear
echo -e "${AZUL_B}########################################${RESET}"
echo -e "${CYAN_B}      YOTSUDACTYL - INSTALLER          ${RESET}"
echo -e "${AZUL_B}########################################${RESET}"

echo -e "\n${AZUL_B}[>]${RESET} Instalando dependencias del sistema y Docker..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates gnupg lsb-release

if ! [ -x "$(command -v docker)" ]; then
    echo -e "${AZUL_B}[>]${RESET} Instalando Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${VERDE}[!] Docker instalado correctamente.${RESET}"
else
    echo -e "${VERDE}[!] Docker ya está instalado.${RESET}"
fi

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib

echo -e "\n${AZUL_B}[>]${RESET} Creando directorios del sistema..."
sudo mkdir -p /var/lib/yotsudactyl/volumes
sudo mkdir -p /var/lib/yotsudactyl/backups
sudo chmod -R 755 /var/lib/yotsudactyl
echo -e "${VERDE}[!] Carpetas de volúmenes listas.${RESET}"

echo -e "\n${AZUL_B}[>]${RESET} Configurando Base de Datos..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS yotsudactyl;"
sudo -u postgres psql -c "CREATE DATABASE yotsudactyl;"
sudo -u postgres psql -d yotsudactyl -f database.sql

echo -e "\n${AZUL_B}[>]${RESET} Insertando Egg predeterminado (Node.js)..."
sudo -u postgres psql -d yotsudactyl -c "INSERT INTO eggs (name, docker_image, startup_command) VALUES ('Node.js 20 (Default)', 'node:20-slim', 'npm start');"

echo -e "\n${AZUL_B}[>]${RESET} Instalando paquetes de Node.js..."
npm install

echo -e "\n${VERDE}########################################${RESET}"
echo -e "${VERDE}   SISTEMA LISTO PARA ARRANCAR         ${RESET}"
echo -e "${VERDE}   Usa: node src/server.js             ${RESET}"
echo -e "${VERDE}########################################${RESET}"
#!/bin/bash

AZUL_B="\e[1;34m"
CYAN_B="\e[1;36m"
VERDE="\e[0;32m"
ROJO="\e[0;31m"
RESET="\e[0m"

clear
echo -e "${AZUL_B}########################################${RESET}"
echo -e "${CYAN_B}      YOTSUDACTYL - INSTALLER          ${RESET}"
echo -e "${AZUL_B}          Kurayami Style               ${RESET}"
echo -e "${AZUL_B}########################################${RESET}"
echo ""

echo -e "${CYAN_B} [1]${RESET} Iniciar instalación completa"
echo -e "${CYAN_B} [2]${RESET} Configurar base de datos"
echo -e "${CYAN_B} [3]${RESET} Salir"
echo ""
read -p " Selecciona una opción: " opt

case $opt in
  1)
    echo -e "\n${AZUL_B}[>]${RESET} Actualizando sistema..."
    sudo apt update && sudo apt upgrade -y
    
    echo -e "\n${AZUL_B}[>]${RESET} ¿Instalar Node.js y PostgreSQL? (s/n)"
    read install_deps
    if [ "$install_deps" = "s" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs postgresql postgresql-contrib
        echo -e "${VERDE}[!] Dependencias instaladas.${RESET}"
    fi

    echo -e "\n${AZUL_B}[>]${RESET} Configurando base de datos..."
    read -p " Nombre para la DB [yotsudactyl]: " db_name
    db_name=${db_name:-yotsudactyl}
    
    sudo -u postgres psql -c "CREATE DATABASE $db_name;"
    sudo -u postgres psql -d $db_name -f database.sql
    echo -e "${VERDE}[!] Tablas creadas correctamente.${RESET}"

    echo -e "\n${AZUL_B}[>]${RESET} Instalando paquetes de Node..."
    npm install
    
    echo -e "\n${VERDE}########################################${RESET}"
    echo -e "${VERDE}   INSTALACIÓN COMPLETADA CON ÉXITO    ${RESET}"
    echo -e "${VERDE}########################################${RESET}"
    ;;
  2)
    echo -e "${AZUL_B}[!] Reconfigurando base de datos...${RESET}"
    # Aquí iría lógica solo para DB
    ;;
  3)
    echo "Saliendo..."
    exit 0
    ;;
  *)
    echo -e "${ROJO}Opción no válida.${RESET}"
    ;;
esac
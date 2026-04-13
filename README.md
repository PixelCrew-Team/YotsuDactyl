# 🐉 Yotsudactyl - Server Management Dashboard

**Yotsudactyl** es un panel de gestión de servidores potente, ligero y diseñado para ser eficiente. Creado con la visión de simplificar la administración de contenedores Docker y servicios web bajo una interfaz intuitiva y robusta.

---

## 🚀 Características Principales

- 🛠 **Gestión de Servidores:** Control total sobre contenedores Docker.
- 🥚 **Sistema de Eggs:** Configuración flexible para diferentes tipos de juegos y aplicaciones (Node.js preinstalado).
- 🔐 **Seguridad Integrada:** Sistema de autenticación de administradores y gestión de sesiones.
- 📊 **Panel de Control:** Interfaz diseñada para monitoreo y administración rápida.
- 🔄 **Persistencia:** Base de datos PostgreSQL para un manejo de datos seguro y escalable.

---

## 📦 Instalación Rápida

Para desplegar Yotsudactyl en un nuevo VPS, solo necesitas ejecutar el siguiente comando (asegúrate de tener permisos de root):

```bash
chmod +x install.sh && ./install.sh
```

🔑 Configuración Inicial
1. Crear cuenta de Administrador:
```bash
node src/createAdmin.js
```

2. Iniciar el panel (modo producción)
```bash
npm start
```

3. Para ver los logs en tiempo real o detener el proceso:
```bash
npm run logs
```  

4. Ver qué está pasando en el servido:
```bash
npm run stop
```  
(esto detiene el panel de forma segura)

---

## 🛠 Requisitos del Sistema

- **SO:** Ubuntu 22.04 LTS o superior (Recomendado).
- **Entorno:** Node.js 20.x.
- **Base de Datos:** PostgreSQL 15+.
- **Virtualización:** Docker Engine (para la gestión de servidores).

---

## 🇩🇴 Créditos y Origen

Este proyecto no es solo código, es pura resistencia y disciplina. 

- **Desarrollador:** Félix (FélixGamer)
- **Origen:** República Dominicana 🇩🇴
- **Fecha de Creación:** 12 de abril de 2026
- **Estado:** Versión 1.0 - Desplegado y funcional.

> "No importa que el hardware sea limitado, si la lógica del desarrollador es imparable."
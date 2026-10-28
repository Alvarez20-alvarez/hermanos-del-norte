# ESTRUCTURA DEL PROYECTO

## FRONTEND

`frontend/src/componentes`
Componentes reutilizables y elementos generales de interfaz.

`frontend/src/componentes/layout`
Header y Sidebar del sistema.

`frontend/src/config`
Configuraciones generales, incluida la URL de la API.

`frontend/src/constantes`
Valores y objetos iniciales usados por el sistema.

`frontend/src/modulos`
Cada función principal del sistema está separada por módulo:
clientes, compras, configuración, empleados, inicio, login, pedidos,
precios, productos, proveedores, reportes, stock y ventas.

`frontend/src/tipos`
Interfaces y tipos de TypeScript.

## BACKEND

`backend/src/config/db.ts`
Única conexión activa a MySQL.

`backend/src/modulos`
Rutas y lógica de cada área del sistema:
auth, caja, clientes, compras, configuración, empleados, pedidos,
productos, proveedores, reportes, roles, sistema, stock y ventas.

`backend/src/server.ts`
Punto de entrada de la API.

## PRODUCCIÓN

Vercel:
Frontend React/Vite.

Railway:
Backend Node/Express y MySQL.

## ARCHIVOS QUE NO DEBEN SUBIRSE A GITHUB

- node_modules
- .env
- contraseñas
- backups SQL con información real
- carpetas dist generadas localmente

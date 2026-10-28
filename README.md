# HERMANOS DEL NORTE
Sistema Integral de Gestión Comercial para supermercado/distribuidora mayorista y minorista.

## Tecnologías

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- SweetAlert2

### Backend
- Node.js
- Express
- TypeScript
- MySQL
- mysql2/promise
- bcrypt
- dotenv

### Producción
- Frontend: Vercel
- Backend: Railway
- Base de datos: MySQL en Railway

## Estructura principal

```text
hermanos-del-norte/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── modulos/
│   │   │   ├── auth/
│   │   │   ├── caja/
│   │   │   ├── clientes/
│   │   │   ├── compras/
│   │   │   ├── configuracion/
│   │   │   ├── empleados/
│   │   │   ├── pedidos/
│   │   │   ├── productos/
│   │   │   ├── proveedores/
│   │   │   ├── reportes/
│   │   │   ├── roles/
│   │   │   ├── sistema/
│   │   │   ├── stock/
│   │   │   └── ventas/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── componentes/
│   │   ├── config/
│   │   ├── constantes/
│   │   ├── modulos/
│   │   ├── servicios/
│   │   ├── tipos/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## Ejecutar localmente

### Backend
```powershell
cd backend
npm install
npm run dev
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Frontend local:
`http://localhost:5173`

Backend local:
`http://localhost:3001`

## Producción

Frontend:
`https://hermanos-del-norte.vercel.app`

Backend:
`https://hermanos-del-norte-production.up.railway.app`

El frontend usa la variable de entorno:

`VITE_API_URL`

En Vercel debe apuntar a:

`https://hermanos-del-norte-production.up.railway.app/api`

## Módulos principales

- Inicio / panel principal
- Ventas
- Caja
- Pedidos y repartos
- Productos
- Stock
- Precios
- Clientes
- Proveedores
- Compras
- Empleados y roles
- Reportes
- Configuración

## Roles

- Administrador
- Cajero
- Repositor

## Base de datos

La conexión principal se encuentra en:

`backend/src/config/db.ts`

No guardar contraseñas ni archivos `.env` en GitHub.

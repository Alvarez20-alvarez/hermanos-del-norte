# Estructura del proyecto

El proyecto fue reorganizado para que cada pantalla se encuentre en su propio módulo.
De esta manera, si hay que cambiar un botón, un texto, un color o una tabla, no hace falta buscar dentro de un archivo gigante.

## Frontend

```text
frontend/src/
├── modulos/
│   ├── login/Login.tsx
│   ├── inicio/Inicio.tsx
│   ├── ventas/Ventas.tsx
│   ├── productos/Productos.tsx
│   ├── stock/Stock.tsx
│   ├── clientes/Clientes.tsx
│   ├── proveedores/Proveedores.tsx
│   ├── compras/Compras.tsx
│   ├── precios/Precios.tsx
│   ├── empleados/Empleados.tsx
│   ├── reportes/Reportes.tsx
│   └── configuracion/Configuracion.tsx
├── componentes/
│   ├── Tarjeta.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Sidebar.tsx
├── config/
│   └── api.ts
├── constantes/
│   └── sistema.ts
├── tipos/
│   └── index.ts
├── App.tsx
├── index.css
└── main.tsx
```

### Ejemplos rápidos

- Cambiar un botón o color de Productos: `frontend/src/modulos/productos/Productos.tsx`
- Cambiar la pantalla de Stock: `frontend/src/modulos/stock/Stock.tsx`
- Cambiar la pantalla de Ventas: `frontend/src/modulos/ventas/Ventas.tsx`
- Cambiar el menú lateral: `frontend/src/componentes/layout/Sidebar.tsx`
- Cambiar el encabezado: `frontend/src/componentes/layout/Header.tsx`
- Cambiar el inicio de sesión: `frontend/src/modulos/login/Login.tsx`

## Backend

```text
backend/src/
├── config/
│   └── db.ts
├── modulos/
│   ├── auth/auth.ts
│   ├── clientes/clientes.ts
│   ├── compras/compras.ts
│   ├── configuracion/configuracion.ts
│   ├── empleados/empleados.ts
│   ├── productos/productos.ts
│   ├── proveedores/proveedores.ts
│   ├── reportes/reportes.ts
│   ├── roles/roles.ts
│   ├── sistema/sistema.ts
│   ├── stock/stock.ts
│   └── ventas/ventas.ts
└── server.ts
```

Cada carpeta de `modulos` contiene el código de esa parte del sistema. `server.ts` solamente inicia el servidor y conecta los módulos.

# Cambios realizados

1. Se separaron las pantallas del frontend por módulo real.
2. Cada área del sistema ahora tiene su propio archivo: Ventas, Productos, Stock, Clientes, Compras, etc.
3. El menú lateral y el encabezado también quedaron separados en componentes propios.
4. La pantalla de inicio de sesión quedó en su propio módulo.
5. Productos mantiene la edición solamente para el Administrador.
6. En Stock se agregó la edición masiva para Repositor y Administrador.
7. El botón `Editar todo` permite modificar varias cantidades y luego guardarlas juntas con `Guardar todos`.
8. Los cambios de stock quedan registrados en el historial como ajustes.
9. El backend también quedó separado por módulos reales (productos, ventas, stock, clientes, etc.) y `server.ts` quedó reducido al inicio y conexión de esos módulos.
10. La organización está pensada para que un cambio visual se encuentre directamente en el módulo correspondiente.

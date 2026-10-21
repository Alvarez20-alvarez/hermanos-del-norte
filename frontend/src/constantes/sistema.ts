import type {
  FormCliente,
  FormEmpleado,
  FormMovimiento,
  FormProducto,
  FormProveedor,
  Rol,
  Seccion,
} from '../tipos'

export const permisos: Record<Rol, Seccion[]> = {
  Administrador: [
    'Inicio', 'Ventas', 'Pedidos', 'Productos', 'Stock', 'Precios', 'Clientes',
    'Proveedores', 'Compras', 'Empleados', 'Reportes', 'Configuracion',
  ],
  Cajero: ['Inicio', 'Ventas', 'Pedidos', 'Productos', 'Clientes'],
  Repositor: ['Inicio', 'Pedidos', 'Productos', 'Stock'],
}

export const proveedorVacio: FormProveedor = {
  nombre: '', cuit: '', telefono: '', direccion: '', email: '',
}

export const productoVacio: FormProducto = {
  codigo_barras: '', nombre: '', categoria: '', presentacion: '',
  precio_compra: '', precio_minorista: '', precio_mayorista: '',
  cantidad_min_mayorista: '1', stock: '', stock_minimo: '',
}

export const movimientoVacio: FormMovimiento = {
  producto_id: '', tipo: 'ENTRADA', cantidad: '', motivo: '',
}

export const clienteVacio: FormCliente = {
  nombre: '', dni_cuit: '', telefono: '', direccion: '', tipo_cliente: 'MINORISTA',
}

export const empleadoVacio: FormEmpleado = {
  nombre: '', usuario: '', password: '', rol_id: '', telefono: '', activo: true,
}

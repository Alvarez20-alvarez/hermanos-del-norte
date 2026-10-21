export type ProductoMasVendido = {
  id: number
  nombre: string
  presentacion: string
  cantidad_vendida: number | string
  total_vendido: number | string
}

export type VentaPorPago = {
  forma_pago: string
  cantidad: number | string
  total: number | string
}

export type VentaPorDia = {
  fecha: string
  cantidad: number | string
  total: number | string
}

export type StockBajoReporte = {
  id: number
  nombre: string
  presentacion: string
  stock: number
  stock_minimo: number
}

export type ProductoRentable = {
  id: number
  nombre: string
  presentacion: string
  cantidad_vendida: number | string
  total_vendido: number | string
  costo_total: number | string
  ganancia: number | string
}

export type ReporteResumen = {
  desde: string
  hasta: string
  ventas: { cantidad: number; total: number; descuentos: number }
  compras: { cantidad: number; total: number }
  movimiento_neto: number
  rentabilidad: { costo_vendido: number; ganancia_bruta: number; margen: number }
  productos_mas_vendidos: ProductoMasVendido[]
  productos_mas_rentables: ProductoRentable[]
  ventas_por_pago: VentaPorPago[]
  ventas_por_dia: VentaPorDia[]
  stock_bajo: StockBajoReporte[]
}

export type PrecioEditable = {
  precio_compra: string
  precio_minorista: string
  precio_mayorista: string
}

export type ItemCompra = {
  producto: Producto
  cantidad: number
  precio_compra: number
}

export type Compra = {
  id: number
  proveedor_id: number | null
  proveedor: string | null
  usuario: string
  total: number | string
  observacion: string
  fecha: string
}

export type Rol = 'Administrador' | 'Cajero' | 'Repositor'

export type Seccion =
  | 'Inicio'
  | 'Ventas'
  | 'Pedidos'
  | 'Productos'
  | 'Stock'
  | 'Precios'
  | 'Clientes'
  | 'Proveedores'
  | 'Compras'
  | 'Empleados'
  | 'Reportes'
  | 'Configuracion'

export type UsuarioSesion = {
  id: number
  nombre: string
  usuario: string
  rol: Rol
  rol_id: number
  telefono: string
}

export type RolBD = { id: number; nombre: Rol; descripcion: string }

export type Empleado = {
  id: number
  nombre: string
  usuario: string
  telefono: string
  activo: number
  rol_id: number
  rol: Rol
  created_at: string
}

export type FormEmpleado = {
  nombre: string
  usuario: string
  password: string
  rol_id: string
  telefono: string
  activo: boolean
}

export type Producto = {
  id: number
  codigo_barras: string | null
  nombre: string
  categoria: string | null
  presentacion: string | null
  precio_compra: number | string
  precio_minorista: number | string
  precio_mayorista: number | string
  cantidad_min_mayorista: number
  stock: number
  stock_minimo: number
  activo: number
}

export type FormProducto = {
  codigo_barras: string
  nombre: string
  categoria: string
  presentacion: string
  precio_compra: string
  precio_minorista: string
  precio_mayorista: string
  cantidad_min_mayorista: string
  stock: string
  stock_minimo: string
}

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE'

export type MovimientoStock = {
  id: number
  producto_id: number
  producto: string
  codigo_barras: string
  tipo: TipoMovimiento
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  motivo: string
  fecha: string
}

export type FormMovimiento = {
  producto_id: string
  tipo: TipoMovimiento
  cantidad: string
  motivo: string
}

export type TipoVenta = 'MINORISTA' | 'MAYORISTA'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'OTRO'
export type CarritoItem = { producto: Producto; cantidad: number }

export type Cliente = {
  id: number
  nombre: string
  dni_cuit: string
  telefono: string
  direccion: string
  tipo_cliente: TipoVenta
  activo: number
}

export type FormCliente = {
  nombre: string
  dni_cuit: string
  telefono: string
  direccion: string
  tipo_cliente: TipoVenta
}

export type Venta = {
  id: number
  usuario: string
  cliente_id: number | null
  cliente: string | null
  tipo_venta: TipoVenta
  forma_pago: FormaPago
  subtotal: number | string
  descuento: number | string
  total: number | string
  fecha: string
}

export type Proveedor = {
  id: number
  nombre: string
  cuit: string
  telefono: string
  direccion: string
  email: string
  activo: number
}

export type FormProveedor = {
  nombre: string
  cuit: string
  telefono: string
  direccion: string
  email: string
}

export type ConfiguracionEmpresa = {
  nombre_empresa: string
  cuit: string
  direccion: string
  telefono: string
  email: string
  alias_pago: string
}


export type EstadoPedido =
  | 'PENDIENTE'
  | 'ENTREGADO'

export type FormaPagoPedido =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'OTRO'

export type PedidoDetalle = {
  id: number
  producto_id: number
  producto: string
  presentacion: string | null
  cantidad: number
  precio_unitario: number | string
  subtotal: number | string
}

export type PagoPedido = {
  id: number
  pedido_id: number
  monto: number | string
  forma_pago: FormaPagoPedido
  nota: string
  usuario: string
  fecha: string
}

export type Pedido = {
  id: number
  cliente_id: number | null
  cliente_nombre: string
  telefono: string
  direccion: string
  referencia: string
  observacion: string
  estado: EstadoPedido
  usuario: string
  total: number | string
  pagado: number | string
  saldo: number | string
  fecha: string
  actualizado_en: string
  detalles: PedidoDetalle[]
  pagos: PagoPedido[]
}

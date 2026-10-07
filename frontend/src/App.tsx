import { useEffect, useState } from 'react'

const API = 'http://localhost:3001/api'

// =====================================================
// ÍNDICE RÁPIDO - CTRL + F
// =====================================================
// TIPOS
// PERMISOS
// FORMULARIOS VACÍOS
// APP
// REPORTES - ESTADOS
// PRECIOS - ESTADOS
// COMPRAS - ESTADOS
// PROVEEDORES - ESTADOS
// LOGIN
// PRODUCTOS
// STOCK
// CLIENTES
// EMPLEADOS
// VENTAS
// CARGA DE DATOS
// COMPRAS
// PRECIOS
// FILTROS
// SISTEMA
// INICIO
// REPORTES
// CONFIGURACION
// TARJETA DEL DASHBOARD
// =====================================================

// =====================================================
// TIPOS
// =====================================================

type ProductoMasVendido = {
  id: number
  nombre: string
  presentacion: string
  cantidad_vendida: number | string
  total_vendido: number | string
}

type VentaPorPago = {
  forma_pago: string
  cantidad: number | string
  total: number | string
}

type VentaPorDia = {
  fecha: string
  cantidad: number | string
  total: number | string
}

type StockBajoReporte = {
  id: number
  nombre: string
  presentacion: string
  stock: number
  stock_minimo: number
}

type ProductoRentable = {
  id: number
  nombre: string
  presentacion: string
  cantidad_vendida: number | string
  total_vendido: number | string
  costo_total: number | string
  ganancia: number | string
}

type ReporteResumen = {
  desde: string
  hasta: string

  ventas: {
    cantidad: number
    total: number
    descuentos: number
  }

  compras: {
    cantidad: number
    total: number
  }

  movimiento_neto: number

  rentabilidad: {
    costo_vendido: number
    ganancia_bruta: number
    margen: number
  }

  productos_mas_vendidos: ProductoMasVendido[]

  productos_mas_rentables: ProductoRentable[]

  ventas_por_pago: VentaPorPago[]

  ventas_por_dia: VentaPorDia[]

  stock_bajo: StockBajoReporte[]
}

type PrecioEditable = {
  precio_compra: string
  precio_minorista: string
  precio_mayorista: string
}


type ItemCompra = {
  producto: Producto
  cantidad: number
  precio_compra: number
}

type Compra = {
  id: number
  proveedor_id: number | null
  proveedor: string | null
  usuario: string
  total: number | string
  observacion: string
  fecha: string
}

type Rol =
  | 'Administrador'
  | 'Cajero'
  | 'Repositor'

type Seccion =
  | 'Inicio'
  | 'Ventas'
  | 'Productos'
  | 'Stock'
  | 'Precios'
  | 'Clientes'
  | 'Proveedores'
  | 'Compras'
  | 'Empleados'
  | 'Reportes'
  | 'Configuracion'

type UsuarioSesion = {
  id: number
  nombre: string
  usuario: string
  rol: Rol
  rol_id: number
  telefono: string
}

type RolBD = {
  id: number
  nombre: Rol
  descripcion: string
}

type Empleado = {
  id: number
  nombre: string
  usuario: string
  telefono: string
  activo: number
  rol_id: number
  rol: Rol
  created_at: string
}

type FormEmpleado = {
  nombre: string
  usuario: string
  password: string
  rol_id: string
  telefono: string
  activo: boolean
}

type Producto = {
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

type FormProducto = {
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

type TipoMovimiento =
  | 'ENTRADA'
  | 'SALIDA'
  | 'AJUSTE'

type MovimientoStock = {
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

type FormMovimiento = {
  producto_id: string
  tipo: TipoMovimiento
  cantidad: string
  motivo: string
}

type TipoVenta =
  | 'MINORISTA'
  | 'MAYORISTA'

type FormaPago =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'DEBITO'
  | 'CREDITO'
  | 'OTRO'

type CarritoItem = {
  producto: Producto
  cantidad: number
}

type Cliente = {
  id: number
  nombre: string
  dni_cuit: string
  telefono: string
  direccion: string
  tipo_cliente: TipoVenta
  activo: number
}

type FormCliente = {
  nombre: string
  dni_cuit: string
  telefono: string
  direccion: string
  tipo_cliente: TipoVenta
}

type Venta = {
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

type Proveedor = {
  id: number
  nombre: string
  cuit: string
  telefono: string
  direccion: string
  email: string
  activo: number
}

type FormProveedor = {
  nombre: string
  cuit: string
  telefono: string
  direccion: string
  email: string
}

type ConfiguracionEmpresa = {
  nombre_empresa: string
  cuit: string
  direccion: string
  telefono: string
  email: string
  alias_pago: string
}

// =====================================================
// PERMISOS
// =====================================================

const permisos: Record<Rol, Seccion[]> = {
  Administrador: [
    'Inicio',
    'Ventas',
    'Productos',
    'Stock',
    'Precios',
    'Clientes',
    'Proveedores',
    'Compras',
    'Empleados',
    'Reportes',
    'Configuracion',
  ],

  Cajero: [
    'Inicio',
    'Ventas',
    'Productos',
    'Clientes',
  ],

  Repositor: [
    'Inicio',
    'Productos',
    'Stock',
  ],
}

// =====================================================
// FORMULARIOS VACÍOS
// =====================================================

const proveedorVacio: FormProveedor = {
  nombre: '',
  cuit: '',
  telefono: '',
  direccion: '',
  email: '',
}

const productoVacio: FormProducto = {
  codigo_barras: '',
  nombre: '',
  categoria: '',
  presentacion: '',
  precio_compra: '',
  precio_minorista: '',
  precio_mayorista: '',
  cantidad_min_mayorista: '1',
  stock: '',
  stock_minimo: '',
}

const movimientoVacio: FormMovimiento = {
  producto_id: '',
  tipo: 'ENTRADA',
  cantidad: '',
  motivo: '',
}

const clienteVacio: FormCliente = {
  nombre: '',
  dni_cuit: '',
  telefono: '',
  direccion: '',
  tipo_cliente: 'MINORISTA',
}

const empleadoVacio: FormEmpleado = {
  nombre: '',
  usuario: '',
  password: '',
  rol_id: '',
  telefono: '',
  activo: true,
}

// =====================================================
// APP
// =====================================================

function App() {

  // ===================================================
  // CONFIGURACION - ESTADOS
  // ===================================================

  const [
    configuracion,
    setConfiguracion,
  ] = useState<ConfiguracionEmpresa>({
    nombre_empresa: 'HERMANOS DEL NORTE',
    cuit: '',
    direccion: '',
    telefono: '',
    email: '',
    alias_pago: '',
  })

  const [
    guardandoConfiguracion,
    setGuardandoConfiguracion,
  ] = useState(false)



  // ===================================================
// REPORTES - ESTADOS
// ===================================================

const hoy =
  new Date()
    .toISOString()
    .slice(0, 10)

const [
  reporteDesde,
  setReporteDesde,
] = useState(hoy)

const [
  reporteHasta,
  setReporteHasta,
] = useState(hoy)

const [
  reporte,
  setReporte,
] = useState<ReporteResumen | null>(null)

const [
  cargandoReporte,
  setCargandoReporte,
] = useState(false)

  // ===================================================
// PRECIOS - ESTADOS
// ===================================================

const [
  busquedaPrecio,
  setBusquedaPrecio,
] = useState('')

const [
  preciosEditables,
  setPreciosEditables,
] = useState<
  Record<number, PrecioEditable>
>({})

// ===================================================
// COMPRAS - ESTADOS
// ===================================================

const [compras, setCompras] =
  useState<Compra[]>([])

const [
  proveedorCompra,
  setProveedorCompra,
] = useState('')

const [
  productoCompra,
  setProductoCompra,
] = useState('')

const [
  cantidadCompra,
  setCantidadCompra,
] = useState('1')

const [
  precioCompra,
  setPrecioCompra,
] = useState('')

const [
  observacionCompra,
  setObservacionCompra,
] = useState('')

const [
  carritoCompra,
  setCarritoCompra,
] = useState<ItemCompra[]>([])

const [
  guardandoCompra,
  setGuardandoCompra,
] = useState(false)

// ===================================================
// PROVEEDORES - ESTADOS
// ===================================================

const [proveedores, setProveedores] =
  useState<Proveedor[]>([])

const [
  busquedaProveedor,
  setBusquedaProveedor,
] = useState('')

const [
  mostrarFormularioProveedor,
  setMostrarFormularioProveedor,
] = useState(false)

const [
  proveedorEditando,
  setProveedorEditando,
] = useState<number | null>(null)

const [
  formularioProveedor,
  setFormularioProveedor,
] = useState<FormProveedor>(
  proveedorVacio
)


  // ===================================================
  // LOGIN
  // ===================================================

  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [iniciandoSesion, setIniciandoSesion] =
    useState(false)

  const [
    usuarioLogueado,
    setUsuarioLogueado,
  ] = useState<UsuarioSesion | null>(null)

  const [
    seccionActual,
    setSeccionActual,
  ] = useState<Seccion>('Inicio')

  // ===================================================
  // PRODUCTOS
  // ===================================================

  const [productos, setProductos] =
    useState<Producto[]>([])

  const [busquedaProducto, setBusquedaProducto] =
    useState('')

  const [
    mostrarFormularioProducto,
    setMostrarFormularioProducto,
  ] = useState(false)

  const [
    productoEditando,
    setProductoEditando,
  ] = useState<number | null>(null)

  const [
    formularioProducto,
    setFormularioProducto,
  ] = useState<FormProducto>(productoVacio)

  // ===================================================
  // STOCK
  // ===================================================

  const [movimientos, setMovimientos] =
    useState<MovimientoStock[]>([])

  const [
    formularioMovimiento,
    setFormularioMovimiento,
  ] = useState<FormMovimiento>(movimientoVacio)

  const [busquedaStock, setBusquedaStock] =
    useState('')

  // ===================================================
  // CLIENTES
  // ===================================================

  const [clientes, setClientes] =
    useState<Cliente[]>([])

  const [busquedaCliente, setBusquedaCliente] =
    useState('')

  const [
    mostrarFormularioCliente,
    setMostrarFormularioCliente,
  ] = useState(false)

  const [
    clienteEditando,
    setClienteEditando,
  ] = useState<number | null>(null)

  const [
    formularioCliente,
    setFormularioCliente,
  ] = useState<FormCliente>(clienteVacio)

  // ===================================================
  // EMPLEADOS
  // ===================================================

  const [empleados, setEmpleados] =
    useState<Empleado[]>([])

  const [roles, setRoles] =
    useState<RolBD[]>([])

  const [busquedaEmpleado, setBusquedaEmpleado] =
    useState('')

  const [
    mostrarFormularioEmpleado,
    setMostrarFormularioEmpleado,
  ] = useState(false)

  const [
    empleadoEditando,
    setEmpleadoEditando,
  ] = useState<number | null>(null)

  const [
    formularioEmpleado,
    setFormularioEmpleado,
  ] = useState<FormEmpleado>(empleadoVacio)

// ===================================================
// PROVEEDORES
// ===================================================

const nuevoProveedor = () => {
  setProveedorEditando(null)

  setFormularioProveedor(
    proveedorVacio
  )

  setMostrarFormularioProveedor(true)
}

const editarProveedor = (
  proveedor: Proveedor
) => {
  setProveedorEditando(
    proveedor.id
  )

  setFormularioProveedor({
    nombre:
      proveedor.nombre,

    cuit:
      proveedor.cuit || '',

    telefono:
      proveedor.telefono || '',

    direccion:
      proveedor.direccion || '',

    email:
      proveedor.email || '',
  })

  setMostrarFormularioProveedor(true)
}

const guardarProveedor = async (
  e: React.FormEvent
) => {
  e.preventDefault()

  try {
    const respuesta = await fetch(
      proveedorEditando
        ? `${API}/proveedores/${proveedorEditando}`
        : `${API}/proveedores`,
      {
        method:
          proveedorEditando
            ? 'PUT'
            : 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          formularioProveedor
        ),
      }
    )

    const datos =
      await respuesta.json()

    if (!respuesta.ok) {
      alert(datos.mensaje)
      return
    }

    alert(
      proveedorEditando
        ? 'Proveedor actualizado correctamente'
        : 'Proveedor creado correctamente'
    )

    setMostrarFormularioProveedor(false)

    setProveedorEditando(null)

    setFormularioProveedor(
      proveedorVacio
    )

    await cargarProveedores()
  } catch {
    alert(
      'No se pudo guardar el proveedor'
    )
  }
}

const eliminarProveedor = async (
  proveedor: Proveedor
) => {
  if (
    !window.confirm(
      `¿Eliminar al proveedor ${proveedor.nombre}?`
    )
  ) {
    return
  }

  try {
    const respuesta = await fetch(
      `${API}/proveedores/${proveedor.id}`,
      {
        method: 'DELETE',
      }
    )

    const datos =
      await respuesta.json()

    if (!respuesta.ok) {
      alert(datos.mensaje)
      return
    }

    alert(
      'Proveedor eliminado correctamente'
    )

    await cargarProveedores()
  } catch {
    alert(
      'No se pudo eliminar el proveedor'
    )
  }
}

  // ===================================================
  // VENTAS
  // ===================================================

  const [codigoVenta, setCodigoVenta] =
    useState('')

  const [
    productoVentaSeleccionado,
    setProductoVentaSeleccionado,
  ] = useState('')

  const [carrito, setCarrito] =
    useState<CarritoItem[]>([])

  const [tipoVenta, setTipoVenta] =
    useState<TipoVenta>('MINORISTA')

  const [formaPago, setFormaPago] =
    useState<FormaPago>('EFECTIVO')

  const [clienteVenta, setClienteVenta] =
    useState('')

  const [descuento, setDescuento] =
    useState('0')

  const [ventas, setVentas] =
    useState<Venta[]>([])

  const [
    guardandoVenta,
    setGuardandoVenta,
  ] = useState(false)

  // ===================================================
  // CARGA DE DATOS
  // ===================================================


const cargarProveedores = async () => {
  try {
    const respuesta = await fetch(
      `${API}/proveedores`
    )

    const datos =
      await respuesta.json()

    if (respuesta.ok) {
      setProveedores(datos)
    }
  } catch (error) {
    console.error(error)
  }
}

  const cargarConfiguracion = async () => {
    try {
      const respuesta = await fetch(
        `${API}/configuracion`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setConfiguracion({
          nombre_empresa:
            datos.nombre_empresa ||
            'HERMANOS DEL NORTE',
          cuit:
            datos.cuit || '',
          direccion:
            datos.direccion || '',
          telefono:
            datos.telefono || '',
          email:
            datos.email || '',
          alias_pago:
            datos.alias_pago || '',
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const cargarProductos = async () => {
    try {
      const respuesta = await fetch(
        `${API}/productos`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setProductos(datos)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const cargarMovimientos = async () => {
    try {
      const respuesta = await fetch(
        `${API}/movimientos-stock`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setMovimientos(datos)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const cargarClientes = async () => {
    try {
      const respuesta = await fetch(
        `${API}/clientes`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setClientes(datos)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const cargarVentas = async () => {
    try {
      const respuesta = await fetch(
        `${API}/ventas`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setVentas(datos)
      }
    } catch (error) {
      console.error(error)
    }
  }

const cargarCompras = async () => {
  try {
    const respuesta = await fetch(
      `${API}/compras`
    )

    const datos =
      await respuesta.json()

    if (respuesta.ok) {
      setCompras(datos)
    }
  } catch (error) {
    console.error(error)
  }
}


  const cargarEmpleados = async () => {
    try {
      const respuesta = await fetch(
        `${API}/empleados`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setEmpleados(datos)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const cargarReporte = async (
  desde = reporteDesde,
  hasta = reporteHasta
) => {
  try {
    setCargandoReporte(true)

    const respuesta = await fetch(
      `${API}/reportes/resumen?desde=${desde}&hasta=${hasta}`
    )

    const datos =
      await respuesta.json()

    if (!respuesta.ok) {
      alert(
        datos.mensaje ||
        'No se pudo generar el reporte'
      )
      return
    }

    setReporte(datos)
  } catch {
    alert(
      'No se pudo conectar con el servidor'
    )
  } finally {
    setCargandoReporte(false)
  }
}

  const cargarRoles = async () => {
    try {
      const respuesta = await fetch(
        `${API}/roles`
      )

      const datos = await respuesta.json()

      if (respuesta.ok) {
        setRoles(datos)
      }
    } catch (error) {
      console.error(error)
    }
  }

useEffect(() => {
  cargarProductos()
  cargarMovimientos()
  cargarClientes()
  cargarVentas()
  cargarEmpleados()
  cargarRoles()
  cargarProveedores()
  cargarCompras()
  cargarReporte()
  cargarConfiguracion()
}, [])

  // ===================================================
  // LOGIN REAL
  // ===================================================

  const iniciarSesion = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setMensaje('')
    setIniciandoSesion(true)

    try {
      const respuesta = await fetch(
        `${API}/auth/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            usuario,
            password,
          }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        setMensaje(
          datos.mensaje ||
            'No se pudo iniciar sesión'
        )

        return
      }

      setUsuarioLogueado(datos.usuario)

      setUsuario('')
      setPassword('')
      setMensaje('')
      setSeccionActual('Inicio')

      await cargarProductos()
      await cargarClientes()
      await cargarVentas()
      await cargarReporte()
      await cargarMovimientos()
      await cargarEmpleados()
      await cargarRoles()
    } catch {
      setMensaje(
        'No se pudo conectar con el servidor'
      )
    } finally {
      setIniciandoSesion(false)
    }
  }

  const cerrarSesion = () => {
    setUsuarioLogueado(null)
    setSeccionActual('Inicio')
    setCarrito([])
    setClienteVenta('')
  }

  // ===================================================
  // PRODUCTOS
  // ===================================================

  const nuevoProducto = () => {
    setProductoEditando(null)
    setFormularioProducto(productoVacio)
    setMostrarFormularioProducto(true)
  }

  const editarProducto = (
    producto: Producto
  ) => {
    setProductoEditando(producto.id)

    setFormularioProducto({
      codigo_barras:
        producto.codigo_barras || '',

      nombre:
        producto.nombre,

      categoria:
        producto.categoria || '',

      presentacion:
        producto.presentacion || '',

      precio_compra:
        String(producto.precio_compra),

      precio_minorista:
        String(producto.precio_minorista),

      precio_mayorista:
        String(producto.precio_mayorista),

      cantidad_min_mayorista:
        String(
          producto.cantidad_min_mayorista
        ),

      stock:
        String(producto.stock),

      stock_minimo:
        String(producto.stock_minimo),
    })

    setMostrarFormularioProducto(true)
  }

  const guardarProducto = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    try {
      const respuesta = await fetch(
        productoEditando
          ? `${API}/productos/${productoEditando}`
          : `${API}/productos`,
        {
          method:
            productoEditando
              ? 'PUT'
              : 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            formularioProducto
          ),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        return
      }

      alert(
        productoEditando
          ? 'Producto actualizado correctamente'
          : 'Producto creado correctamente'
      )

      setMostrarFormularioProducto(false)
      setProductoEditando(null)
      setFormularioProducto(productoVacio)

      await cargarProductos()
    } catch {
      alert(
        'No se pudo guardar el producto'
      )
    }
  }

  // ===================================================
  // STOCK
  // ===================================================

  const registrarMovimiento = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!formularioMovimiento.producto_id) {
      alert('Seleccioná un producto')
      return
    }

    try {
      const respuesta = await fetch(
        `${API}/stock/movimiento`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            formularioMovimiento
          ),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        return
      }

      alert(
        `Stock: ${datos.stock_anterior} → ${datos.stock_nuevo}`
      )

      setFormularioMovimiento(
        movimientoVacio
      )

      await cargarProductos()
      await cargarMovimientos()
    } catch {
      alert(
        'No se pudo registrar el movimiento'
      )
    }
  }

  // ===================================================
  // CLIENTES
  // ===================================================

  const nuevoCliente = () => {
    setClienteEditando(null)
    setFormularioCliente(clienteVacio)
    setMostrarFormularioCliente(true)
  }

  const editarCliente = (
    cliente: Cliente
  ) => {
    setClienteEditando(cliente.id)

    setFormularioCliente({
      nombre: cliente.nombre,
      dni_cuit: cliente.dni_cuit || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      tipo_cliente:
        cliente.tipo_cliente,
    })

    setMostrarFormularioCliente(true)
  }

  const guardarCliente = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    try {
      const respuesta = await fetch(
        clienteEditando
          ? `${API}/clientes/${clienteEditando}`
          : `${API}/clientes`,
        {
          method:
            clienteEditando
              ? 'PUT'
              : 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            formularioCliente
          ),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        return
      }

      alert(
        clienteEditando
          ? 'Cliente actualizado'
          : 'Cliente creado'
      )

      setMostrarFormularioCliente(false)
      setClienteEditando(null)
      setFormularioCliente(clienteVacio)

      await cargarClientes()
    } catch {
      alert(
        'No se pudo guardar el cliente'
      )
    }
  }

  const eliminarCliente = async (
    cliente: Cliente
  ) => {
    if (
      !window.confirm(
        `¿Eliminar a ${cliente.nombre}?`
      )
    ) {
      return
    }

    const respuesta = await fetch(
      `${API}/clientes/${cliente.id}`,
      {
        method: 'DELETE',
      }
    )

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      alert(datos.mensaje)
      return
    }

    await cargarClientes()
  }

  // ===================================================
  // EMPLEADOS
  // ===================================================

  const nuevoEmpleado = () => {
    setEmpleadoEditando(null)

    setFormularioEmpleado({
      ...empleadoVacio,
      rol_id:
        roles.length > 0
          ? String(roles[0].id)
          : '',
    })

    setMostrarFormularioEmpleado(true)
  }

  const editarEmpleado = (
    empleado: Empleado
  ) => {
    setEmpleadoEditando(empleado.id)

    setFormularioEmpleado({
      nombre: empleado.nombre,
      usuario: empleado.usuario,
      password: '',
      rol_id: String(
        empleado.rol_id
      ),
      telefono:
        empleado.telefono || '',
      activo:
        Boolean(empleado.activo),
    })

    setMostrarFormularioEmpleado(true)
  }

  const guardarEmpleado = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (
      !empleadoEditando &&
      !formularioEmpleado.password
    ) {
      alert(
        'La contraseña es obligatoria para un empleado nuevo'
      )
      return
    }

    try {
      const respuesta = await fetch(
        empleadoEditando
          ? `${API}/empleados/${empleadoEditando}`
          : `${API}/empleados`,
        {
          method:
            empleadoEditando
              ? 'PUT'
              : 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            formularioEmpleado
          ),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        return
      }

      alert(
        empleadoEditando
          ? 'Empleado actualizado correctamente'
          : 'Empleado creado correctamente'
      )

      setMostrarFormularioEmpleado(false)
      setEmpleadoEditando(null)
      setFormularioEmpleado(empleadoVacio)

      await cargarEmpleados()
    } catch {
      alert(
        'No se pudo guardar el empleado'
      )
    }
  }

  const cambiarEstadoEmpleado = async (
    empleado: Empleado
  ) => {
    const nuevoEstado =
      !Boolean(empleado.activo)

    const accion =
      nuevoEstado
        ? 'activar'
        : 'desactivar'

    if (
      !window.confirm(
        `¿Seguro que querés ${accion} a ${empleado.nombre}?`
      )
    ) {
      return
    }

    try {
      const respuesta = await fetch(
        `${API}/empleados/${empleado.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            nombre:
              empleado.nombre,

            usuario:
              empleado.usuario,

            password: '',

            rol_id:
              empleado.rol_id,

            telefono:
              empleado.telefono,

            activo:
              nuevoEstado,
          }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        return
      }

      await cargarEmpleados()
    } catch {
      alert(
        'No se pudo cambiar el estado'
      )
    }
  }

  // ===================================================
  // VENTAS
  // ===================================================

  const cambiarClienteVenta = (
    id: string
  ) => {
    setClienteVenta(id)

    if (!id) {
      setTipoVenta('MINORISTA')
      return
    }

    const cliente = clientes.find(
      (item) =>
        item.id === Number(id)
    )

    if (cliente) {
      setTipoVenta(
        cliente.tipo_cliente
      )
    }
  }

  const agregarAlCarrito = (
    producto: Producto
  ) => {
    if (producto.stock <= 0) {
      alert(
        'Este producto no tiene stock'
      )
      return
    }

    const existente = carrito.find(
      (item) =>
        item.producto.id ===
        producto.id
    )

    if (existente) {
      if (
        existente.cantidad >=
        producto.stock
      ) {
        alert(
          'No hay más stock disponible'
        )
        return
      }

      setCarrito(
        carrito.map((item) =>
          item.producto.id ===
          producto.id
            ? {
                ...item,
                cantidad:
                  item.cantidad + 1,
              }
            : item
        )
      )

      return
    }

    setCarrito([
      ...carrito,
      {
        producto,
        cantidad: 1,
      },
    ])
  }

  const buscarCodigo = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    const codigo =
      codigoVenta.trim()

    if (!codigo) return

    try {
      const respuesta = await fetch(
        `${API}/productos/codigo/${codigo}`
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        setCodigoVenta('')
        return
      }

      agregarAlCarrito(datos)
      setCodigoVenta('')
    } catch {
      alert(
        'No se pudo buscar el código'
      )
    }
  }

  const agregarProductoManual = () => {
    const producto = productos.find(
      (item) =>
        item.id ===
        Number(
          productoVentaSeleccionado
        )
    )

    if (!producto) {
      alert(
        'Seleccioná un producto'
      )
      return
    }

    agregarAlCarrito(producto)

    setProductoVentaSeleccionado('')
  }

  const cambiarCantidad = (
    productoId: number,
    cantidad: number
  ) => {
    const item = carrito.find(
      (item) =>
        item.producto.id ===
        productoId
    )

    if (!item) return

    if (cantidad <= 0) {
      setCarrito(
        carrito.filter(
          (item) =>
            item.producto.id !==
            productoId
        )
      )

      return
    }

    if (
      cantidad >
      item.producto.stock
    ) {
      alert(
        `Stock disponible: ${item.producto.stock}`
      )
      return
    }

    setCarrito(
      carrito.map((item) =>
        item.producto.id ===
        productoId
          ? {
              ...item,
              cantidad,
            }
          : item
      )
    )
  }

  const obtenerPrecio = (
    producto: Producto
  ) => {
    return tipoVenta ===
      'MAYORISTA'
      ? Number(
          producto.precio_mayorista
        )
      : Number(
          producto.precio_minorista
        )
  }

  const subtotalVenta =
    carrito.reduce(
      (total, item) =>
        total +
        obtenerPrecio(
          item.producto
        ) *
          item.cantidad,
      0
    )

  const descuentoNumero =
    Math.max(
      0,
      Number(descuento) || 0
    )

  const totalVenta =
    Math.max(
      0,
      subtotalVenta -
        descuentoNumero
    )

  const confirmarVenta = async () => {
    if (carrito.length === 0) {
      alert(
        'No hay productos en la venta'
      )
      return
    }

    if (
      !window.confirm(
        `¿Confirmar venta por $${totalVenta.toLocaleString(
          'es-AR'
        )}?`
      )
    ) {
      return
    }

    try {
      setGuardandoVenta(true)

      const respuesta = await fetch(
        `${API}/ventas`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            usuario:
              usuarioLogueado?.usuario,

            cliente_id:
              clienteVenta
                ? Number(
                    clienteVenta
                  )
                : null,

            tipo_venta:
              tipoVenta,

            forma_pago:
              formaPago,

            descuento:
              descuentoNumero,

            productos:
              carrito.map(
                (item) => ({
                  producto_id:
                    item.producto.id,

                  cantidad:
                    item.cantidad,
                })
              ),
          }),
        }
      )

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje)
        return
      }

      alert(
        `Venta #${datos.venta_id} registrada correctamente`
      )

      setCarrito([])
      setClienteVenta('')
      setTipoVenta('MINORISTA')
      setFormaPago('EFECTIVO')
      setDescuento('0')
      setCodigoVenta('')

      await cargarProductos()
      await cargarMovimientos()
      await cargarVentas()
    } catch {
      alert(
        'No se pudo registrar la venta'
      )
    } finally {
      setGuardandoVenta(false)
    }
  }

// ===================================================
// COMPRAS
// ===================================================

const seleccionarProductoCompra = (
  id: string
) => {
  setProductoCompra(id)

  const producto =
    productos.find(
      (item) =>
        item.id === Number(id)
    )

  if (producto) {
    setPrecioCompra(
      String(
        Number(
          producto.precio_compra
        )
      )
    )
  } else {
    setPrecioCompra('')
  }
}

const agregarProductoCompra = () => {
  const producto =
    productos.find(
      (item) =>
        item.id ===
        Number(productoCompra)
    )

  if (!producto) {
    alert(
      'Seleccioná un producto'
    )
    return
  }

  const cantidad =
    Number(cantidadCompra)

  const precio =
    Number(precioCompra)

  if (
    Number.isNaN(cantidad) ||
    cantidad <= 0
  ) {
    alert(
      'Ingresá una cantidad válida'
    )
    return
  }

  if (
    Number.isNaN(precio) ||
    precio < 0
  ) {
    alert(
      'Ingresá un precio de compra válido'
    )
    return
  }

  const existente =
    carritoCompra.find(
      (item) =>
        item.producto.id ===
        producto.id
    )

  if (existente) {
    setCarritoCompra(
      carritoCompra.map(
        (item) =>
          item.producto.id ===
          producto.id
            ? {
                ...item,
                cantidad:
                  item.cantidad +
                  cantidad,

                precio_compra:
                  precio,
              }
            : item
      )
    )
  } else {
    setCarritoCompra([
      ...carritoCompra,
      {
        producto,
        cantidad,
        precio_compra:
          precio,
      },
    ])
  }

  setProductoCompra('')
  setCantidadCompra('1')
  setPrecioCompra('')
}

const eliminarProductoCompra = (
  productoId: number
) => {
  setCarritoCompra(
    carritoCompra.filter(
      (item) =>
        item.producto.id !==
        productoId
    )
  )
}

const cambiarCantidadCompra = (
  productoId: number,
  cantidad: number
) => {
  if (cantidad <= 0) {
    eliminarProductoCompra(
      productoId
    )
    return
  }

  setCarritoCompra(
    carritoCompra.map(
      (item) =>
        item.producto.id ===
        productoId
          ? {
              ...item,
              cantidad,
            }
          : item
    )
  )
}

const cambiarPrecioCompra = (
  productoId: number,
  precio: number
) => {
  if (precio < 0) return

  setCarritoCompra(
    carritoCompra.map(
      (item) =>
        item.producto.id ===
        productoId
          ? {
              ...item,
              precio_compra:
                precio,
            }
          : item
    )
  )
}

const totalCompra =
  carritoCompra.reduce(
    (total, item) =>
      total +
      item.cantidad *
        item.precio_compra,
    0
  )

const confirmarCompra = async () => {
  if (
    carritoCompra.length === 0
  ) {
    alert(
      'Agregá al menos un producto'
    )
    return
  }

  if (
    !window.confirm(
      `¿Registrar compra por $${totalCompra.toLocaleString(
        'es-AR'
      )}?`
    )
  ) {
    return
  }

  try {
    setGuardandoCompra(true)

    const respuesta = await fetch(
      `${API}/compras`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          proveedor_id:
            proveedorCompra
              ? Number(
                  proveedorCompra
                )
              : null,

          usuario:
            usuarioLogueado?.usuario,

          observacion:
            observacionCompra,

          productos:
            carritoCompra.map(
              (item) => ({
                producto_id:
                  item.producto.id,

                cantidad:
                  item.cantidad,

                precio_compra:
                  item.precio_compra,
              })
            ),
        }),
      }
    )

    const datos =
      await respuesta.json()

    if (!respuesta.ok) {
      alert(datos.mensaje)
      return
    }

    alert(
      `Compra #${datos.compra_id} registrada correctamente`
    )

    setProveedorCompra('')
    setProductoCompra('')
    setCantidadCompra('1')
    setPrecioCompra('')
    setObservacionCompra('')
    setCarritoCompra([])

    await cargarProductos()
    await cargarMovimientos()
    await cargarCompras()
    await cargarReporte()
  } catch {
    alert(
      'No se pudo registrar la compra'
    )
  } finally {
    setGuardandoCompra(false)
  }
}

// ===================================================
// PRECIOS
// ===================================================

const cambiarPrecio = (
  producto: Producto,
  campo: keyof PrecioEditable,
  valor: string
) => {
  setPreciosEditables(
    (anteriores) => ({
      ...anteriores,

      [producto.id]: {
        precio_compra:
          anteriores[producto.id]
            ?.precio_compra ??
          String(
            producto.precio_compra
          ),

        precio_minorista:
          anteriores[producto.id]
            ?.precio_minorista ??
          String(
            producto.precio_minorista
          ),

        precio_mayorista:
          anteriores[producto.id]
            ?.precio_mayorista ??
          String(
            producto.precio_mayorista
          ),

        [campo]: valor,
      },
    })
  )
}

const guardarPreciosProducto = async (
  producto: Producto
) => {
  const precios =
    preciosEditables[
      producto.id
    ]

  if (!precios) {
    alert(
      'No realizaste cambios en este producto'
    )
    return
  }

  const compra =
    Number(
      precios.precio_compra
    )

  const minorista =
    Number(
      precios.precio_minorista
    )

  const mayorista =
    Number(
      precios.precio_mayorista
    )

  if (
    Number.isNaN(compra) ||
    Number.isNaN(minorista) ||
    Number.isNaN(mayorista)
  ) {
    alert(
      'Revisá los precios ingresados'
    )
    return
  }

  if (
    compra < 0 ||
    minorista < 0 ||
    mayorista < 0
  ) {
    alert(
      'Los precios no pueden ser negativos'
    )
    return
  }

  try {
    const respuesta = await fetch(
      `${API}/productos/${producto.id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          codigo_barras:
            producto.codigo_barras,

          nombre:
            producto.nombre,

          categoria:
            producto.categoria,

          presentacion:
            producto.presentacion,

          precio_compra:
            compra,

          precio_minorista:
            minorista,

          precio_mayorista:
            mayorista,

          cantidad_min_mayorista:
            producto.cantidad_min_mayorista,

          stock:
            producto.stock,

          stock_minimo:
            producto.stock_minimo,
        }),
      }
    )

    const datos =
      await respuesta.json()

    if (!respuesta.ok) {
      alert(
        datos.mensaje
      )
      return
    }

    alert(
      `${producto.nombre}: precios actualizados`
    )

    setPreciosEditables(
      (anteriores) => {
        const copia = {
          ...anteriores,
        }

        delete copia[
          producto.id
        ]

        return copia
      }
    )

    await cargarProductos()
  } catch {
    alert(
      'No se pudieron actualizar los precios'
    )
  }
}

const obtenerPrecioCampo = (
  producto: Producto,
  campo: keyof PrecioEditable
) => {
  const editado =
    preciosEditables[
      producto.id
    ]

  if (editado) {
    return editado[campo]
  }

  return String(
    producto[campo]
  )
}

const calcularMargen = (
  costo: number,
  venta: number
) => {
  if (venta <= 0) {
    return 0
  }

  return (
    ((venta - costo) /
      venta) *
    100
  )
}

  // ===================================================
  // CONFIGURACION
  // ===================================================

  const guardarConfiguracion = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (
      !configuracion.nombre_empresa.trim()
    ) {
      alert(
        'El nombre de la empresa es obligatorio'
      )
      return
    }

    try {
      setGuardandoConfiguracion(true)

      const respuesta = await fetch(
        `${API}/configuracion`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            configuracion
          ),
        }
      )

      const datos =
        await respuesta.json()

      if (!respuesta.ok) {
        alert(
          datos.mensaje ||
          'No se pudo guardar la configuración'
        )
        return
      }

      alert(
        'Configuración guardada correctamente'
      )

      await cargarConfiguracion()
    } catch {
      alert(
        'No se pudo conectar con el servidor'
      )
    } finally {
      setGuardandoConfiguracion(false)
    }
  }

  // ===================================================
  // FILTROS
  // ===================================================

const productosPrecioFiltrados =
  productos.filter(
    (producto) => {
      const texto =
        busquedaPrecio.toLowerCase()

      return (
        producto.nombre
          .toLowerCase()
          .includes(texto) ||

        (
          producto.codigo_barras ||
          ''
        )
          .toLowerCase()
          .includes(texto) ||

        (
          producto.categoria ||
          ''
        )
          .toLowerCase()
          .includes(texto)
      )
    }
  )

  const productosFiltrados =
    productos.filter(
      (producto) => {
        const texto =
          busquedaProducto.toLowerCase()

        return (
          producto.nombre
            .toLowerCase()
            .includes(texto) ||
          (
            producto.codigo_barras ||
            ''
          )
            .toLowerCase()
            .includes(texto) ||
          (
            producto.categoria ||
            ''
          )
            .toLowerCase()
            .includes(texto)
        )
      }
    )

  const productosStock =
    productos.filter(
      (producto) => {
        const texto =
          busquedaStock.toLowerCase()

        return (
          producto.nombre
            .toLowerCase()
            .includes(texto) ||
          (
            producto.codigo_barras ||
            ''
          )
            .toLowerCase()
            .includes(texto)
        )
      }
    )

  const clientesFiltrados =
    clientes.filter(
      (cliente) => {
        const texto =
          busquedaCliente.toLowerCase()

        return (
          cliente.nombre
            .toLowerCase()
            .includes(texto) ||
          (
            cliente.dni_cuit ||
            ''
          )
            .toLowerCase()
            .includes(texto) ||
          (
            cliente.telefono ||
            ''
          )
            .toLowerCase()
            .includes(texto)
        )
      }
    )

  const empleadosFiltrados =
    empleados.filter(
      (empleado) => {
        const texto =
          busquedaEmpleado.toLowerCase()

        return (
          empleado.nombre
            .toLowerCase()
            .includes(texto) ||
          empleado.usuario
            .toLowerCase()
            .includes(texto) ||
          empleado.rol
            .toLowerCase()
            .includes(texto)
        )
      }
    )

const proveedoresFiltrados =
  proveedores.filter(
    (proveedor) => {
      const texto =
        busquedaProveedor.toLowerCase()

      return (
        proveedor.nombre
          .toLowerCase()
          .includes(texto) ||

        (proveedor.cuit || '')
          .toLowerCase()
          .includes(texto) ||

        (proveedor.telefono || '')
          .toLowerCase()
          .includes(texto)
      )
    }
  )

  const stockBajo =
    productos.filter(
      (producto) =>
        producto.stock <=
        producto.stock_minimo
    ).length

  const empleadosActivos =
    empleados.filter(
      (empleado) =>
        Boolean(empleado.activo)
    ).length

  const productoStockSeleccionado =
    productos.find(
      (producto) =>
        producto.id ===
        Number(
          formularioMovimiento.producto_id
        )
    )

  // ===================================================
  // LOGIN
  // ===================================================

  if (!usuarioLogueado) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

          <div className="text-center mb-8">

            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              HN
            </div>

            <h1 className="text-3xl font-bold">
              HERMANOS DEL NORTE
            </h1>

            <p className="text-slate-500 mt-2">
              Distribuidora Mayorista y Minorista
            </p>

          </div>

          <form
            onSubmit={iniciarSesion}
            className="space-y-5"
          >

            <div>

              <label className="font-semibold block mb-2">
                Usuario
              </label>

              <input
                value={usuario}
                onChange={(e) =>
                  setUsuario(
                    e.target.value
                  )
                }
                placeholder="Ingrese su usuario"
                className="w-full border px-4 py-3 rounded-xl"
              />

            </div>

            <div>

              <label className="font-semibold block mb-2">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Ingrese su contraseña"
                className="w-full border px-4 py-3 rounded-xl"
              />

            </div>

            {mensaje && (
              <div className="bg-red-100 text-red-700 p-3 rounded-xl">
                {mensaje}
              </div>
            )}

            <button
              disabled={
                iniciandoSesion
              }
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {iniciandoSesion
                ? 'Ingresando...'
                : 'Iniciar sesión'}
            </button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Acceso exclusivo para personal autorizado
          </div>

        </div>

      </div>
    )
  }

  const seccionesPermitidas =
    permisos[
      usuarioLogueado.rol
    ]

  // ===================================================
  // SISTEMA
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* SIDEBAR */}

      <aside className="w-72 bg-slate-950 text-white min-h-screen p-5">

        <h1 className="text-2xl font-bold">
          HERMANOS DEL NORTE
        </h1>

        <p className="text-sm text-slate-400 mb-8">
          Mayorista y Minorista
        </p>

        <nav className="space-y-2">

          {seccionesPermitidas.map(
            (seccion) => (

              <button
                key={seccion}
                onClick={() =>
                  setSeccionActual(
                    seccion
                  )
                }
                className={`w-full text-left px-4 py-3 rounded-xl ${
                  seccionActual ===
                  seccion
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {seccion}
              </button>

            )
          )}

        </nav>

      </aside>

      <div className="flex-1 min-w-0">

        {/* HEADER */}

        <header className="bg-white border-b px-8 py-5 flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold">
              {seccionActual}
            </h2>

            <p className="text-sm text-slate-500">
              Sistema Integral de Gestión Comercial
            </p>

          </div>

          <div className="flex items-center gap-5">

            <div className="text-right">

              <p className="font-semibold">
                {
                  usuarioLogueado.nombre
                }
              </p>

              <p className="text-sm text-slate-500">
                {
                  usuarioLogueado.rol
                }
              </p>

            </div>

            <button
              onClick={cerrarSesion}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              Cerrar sesión
            </button>

          </div>

        </header>

        <main className="p-8">

          {/* ================================================= */}
          {/* INICIO */}
          {/* ================================================= */}

          {seccionActual ===
            'Inicio' && (

            <div>

              <div>

                <h3 className="text-3xl font-bold">
                  Panel principal
                </h3>

                <p className="text-slate-500 mt-1">
                  Bienvenido, {usuarioLogueado.nombre}.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mt-8">

                <div className="bg-white border rounded-2xl p-6">
                  <p className="text-slate-500">
                    Ventas de hoy
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    $
                    {Number(
                      reporte?.ventas.total || 0
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    {reporte?.ventas.cantidad || 0} operaciones
                  </p>
                </div>

                <div className="bg-white border rounded-2xl p-6">
                  <p className="text-slate-500">
                    Ganancia bruta
                  </p>

                  <p className="text-3xl font-bold mt-1 text-green-700">
                    $
                    {Number(
                      reporte?.rentabilidad
                        .ganancia_bruta || 0
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    Margen{' '}
                    {Number(
                      reporte?.rentabilidad
                        .margen || 0
                    ).toFixed(1)}
                    %
                  </p>
                </div>

                <div className="bg-white border rounded-2xl p-6">
                  <p className="text-slate-500">
                    Compras de hoy
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    $
                    {Number(
                      reporte?.compras.total || 0
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    {reporte?.compras.cantidad || 0} compras
                  </p>
                </div>

                <Tarjeta
                  titulo="Stock bajo"
                  valor={stockBajo}
                />

                <Tarjeta
                  titulo="Clientes"
                  valor={clientes.length}
                />

              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

                <div className="bg-white border rounded-2xl overflow-hidden">

                  <div className="p-5 border-b">

                    <h4 className="text-xl font-bold">
                      Productos más vendidos hoy
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      Ranking según las ventas del día.
                    </p>

                  </div>

                  {reporte &&
                  reporte.productos_mas_vendidos.length >
                    0 ? (

                    <div>

                      {reporte.productos_mas_vendidos
                        .slice(0, 5)
                        .map(
                          (
                            producto,
                            indice
                          ) => (

                          <div
                            key={producto.id}
                            className="flex justify-between items-center p-4 border-t first:border-t-0"
                          >

                            <div>

                              <p className="font-semibold">
                                {indice + 1}.{' '}
                                {producto.nombre}
                              </p>

                              <p className="text-xs text-slate-500">
                                {producto.cantidad_vendida}{' '}
                                vendidos
                              </p>

                            </div>

                            <strong>
                              $
                              {Number(
                                producto.total_vendido
                              ).toLocaleString(
                                'es-AR'
                              )}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="p-8 text-center text-slate-500">
                      Todavía no hay ventas hoy.
                    </div>

                  )}

                </div>

                <div className="bg-white border rounded-2xl overflow-hidden">

                  <div className="p-5 border-b">

                    <h4 className="text-xl font-bold">
                      Alertas de stock
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      Productos que necesitan reposición.
                    </p>

                  </div>

                  {reporte &&
                  reporte.stock_bajo.length >
                    0 ? (

                    <div>

                      {reporte.stock_bajo
                        .slice(0, 6)
                        .map(
                          (producto) => (

                          <div
                            key={producto.id}
                            className="flex justify-between items-center p-4 border-t first:border-t-0"
                          >

                            <div>

                              <p className="font-semibold">
                                {producto.nombre}
                              </p>

                              <p className="text-xs text-slate-500">
                                Mínimo:{' '}
                                {producto.stock_minimo}
                              </p>

                            </div>

                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                              Stock {producto.stock}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="p-8 text-center text-slate-500">
                      No hay productos con stock bajo.
                    </div>

                  )}

                </div>

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* EMPLEADOS */}
          {/* ================================================= */}

          {seccionActual ===
            'Empleados' && (

            <div>

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-3xl font-bold">
                    Empleados
                  </h3>

                  <p className="text-slate-500">
                    Administrá usuarios, contraseñas y permisos.
                  </p>

                </div>

                <button
                  onClick={
                    nuevoEmpleado
                  }
                  className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
                >
                  + Nuevo empleado
                </button>

              </div>

              {mostrarFormularioEmpleado && (

                <form
                  onSubmit={
                    guardarEmpleado
                  }
                  className="bg-white border rounded-2xl p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <div>

                    <label className="font-semibold block mb-2">
                      Nombre completo
                    </label>

                    <input
                      required
                      value={
                        formularioEmpleado.nombre
                      }
                      onChange={(e) =>
                        setFormularioEmpleado({
                          ...formularioEmpleado,
                          nombre:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Usuario
                    </label>

                    <input
                      required
                      value={
                        formularioEmpleado.usuario
                      }
                      onChange={(e) =>
                        setFormularioEmpleado({
                          ...formularioEmpleado,
                          usuario:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Contraseña
                    </label>

                    <input
                      type="password"
                      value={
                        formularioEmpleado.password
                      }
                      onChange={(e) =>
                        setFormularioEmpleado({
                          ...formularioEmpleado,
                          password:
                            e.target.value,
                        })
                      }
                      placeholder={
                        empleadoEditando
                          ? 'Dejar vacío para mantener la actual'
                          : 'Contraseña'
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Rol
                    </label>

                    <select
                      required
                      value={
                        formularioEmpleado.rol_id
                      }
                      onChange={(e) =>
                        setFormularioEmpleado({
                          ...formularioEmpleado,
                          rol_id:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    >

                      <option value="">
                        Seleccionar rol
                      </option>

                      {roles.map(
                        (rol) => (

                          <option
                            key={rol.id}
                            value={rol.id}
                          >
                            {rol.nombre}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Teléfono
                    </label>

                    <input
                      value={
                        formularioEmpleado.telefono
                      }
                      onChange={(e) =>
                        setFormularioEmpleado({
                          ...formularioEmpleado,
                          telefono:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  {empleadoEditando && (

                    <div className="flex items-center">

                      <label className="flex items-center gap-3">

                        <input
                          type="checkbox"
                          checked={
                            formularioEmpleado.activo
                          }
                          onChange={(e) =>
                            setFormularioEmpleado({
                              ...formularioEmpleado,
                              activo:
                                e.target.checked,
                            })
                          }
                          className="w-5 h-5"
                        />

                        <span className="font-semibold">
                          Empleado activo
                        </span>

                      </label>

                    </div>

                  )}

                  <div className="md:col-span-2 flex gap-3">

                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl">
                      {empleadoEditando
                        ? 'Guardar cambios'
                        : 'Crear empleado'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormularioEmpleado(
                          false
                        )
                        setEmpleadoEditando(
                          null
                        )
                      }}
                      className="border px-6 py-3 rounded-xl"
                    >
                      Cancelar
                    </button>

                  </div>

                </form>

              )}

              <div className="bg-white border rounded-2xl p-5 mt-6">

                <input
                  value={
                    busquedaEmpleado
                  }
                  onChange={(e) =>
                    setBusquedaEmpleado(
                      e.target.value
                    )
                  }
                  placeholder="Buscar empleado..."
                  className="border px-4 py-3 rounded-xl w-full md:w-96"
                />

              </div>

              <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr>

                      <th className="p-4 text-left">
                        Empleado
                      </th>

                      <th className="p-4 text-left">
                        Usuario
                      </th>

                      <th className="p-4 text-left">
                        Rol
                      </th>

                      <th className="p-4 text-left">
                        Teléfono
                      </th>

                      <th className="p-4 text-center">
                        Estado
                      </th>

                      <th className="p-4 text-center">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {empleadosFiltrados.map(
                      (empleado) => (

                        <tr
                          key={empleado.id}
                          className="border-t"
                        >

                          <td className="p-4 font-semibold">
                            {empleado.nombre}
                          </td>

                          <td className="p-4">
                            {empleado.usuario}
                          </td>

                          <td className="p-4">
                            {empleado.rol}
                          </td>

                          <td className="p-4">
                            {empleado.telefono ||
                              '-'}
                          </td>

                          <td className="p-4 text-center">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                empleado.activo
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {empleado.activo
                                ? 'ACTIVO'
                                : 'INACTIVO'}
                            </span>

                          </td>

                          <td className="p-4">

                            <div className="flex justify-center gap-2">

                              <button
                                onClick={() =>
                                  editarEmpleado(
                                    empleado
                                  )
                                }
                                className="bg-slate-100 px-4 py-2 rounded-lg font-semibold"
                              >
                                Editar
                              </button>

                              {empleado.id !==
                                usuarioLogueado.id && (

                                <button
                                  onClick={() =>
                                    cambiarEstadoEmpleado(
                                      empleado
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg font-semibold ${
                                    empleado.activo
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {empleado.activo
                                    ? 'Desactivar'
                                    : 'Activar'}
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* VENTAS */}
          {/* ================================================= */}

          {seccionActual ===
            'Ventas' && (

            <div>

              <h3 className="text-3xl font-bold">
                Caja / Ventas
              </h3>

              <p className="text-slate-500">
                Lector de código de barras y registro de ventas.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

                <div className="xl:col-span-2 space-y-5">

                  <div className="bg-white border rounded-2xl p-6">

                    <h4 className="text-xl font-bold">
                      Código de barras
                    </h4>

                    <form
                      onSubmit={
                        buscarCodigo
                      }
                      className="flex gap-3 mt-4"
                    >

                      <input
                        autoFocus
                        value={
                          codigoVenta
                        }
                        onChange={(e) =>
                          setCodigoVenta(
                            e.target.value
                          )
                        }
                        placeholder="Escanear código..."
                        className="flex-1 border-2 px-5 py-4 rounded-xl"
                      />

                      <button className="bg-slate-900 text-white px-6 rounded-xl">
                        Buscar
                      </button>

                    </form>

                    <div className="flex gap-3 mt-4">

                      <select
                        value={
                          productoVentaSeleccionado
                        }
                        onChange={(e) =>
                          setProductoVentaSeleccionado(
                            e.target.value
                          )
                        }
                        className="flex-1 border px-4 py-3 rounded-xl"
                      >

                        <option value="">
                          Agregar producto manualmente
                        </option>

                        {productos.map(
                          (producto) => (

                            <option
                              key={producto.id}
                              value={producto.id}
                            >
                              {producto.nombre} - Stock {producto.stock}
                            </option>

                          )
                        )}

                      </select>

                      <button
                        type="button"
                        onClick={
                          agregarProductoManual
                        }
                        className="border px-5 rounded-xl"
                      >
                        Agregar
                      </button>

                    </div>

                  </div>

                  <div className="bg-white border rounded-2xl overflow-x-auto">

                    <table className="w-full">

                      <thead className="bg-slate-100">

                        <tr>
                          <th className="p-4 text-left">
                            Producto
                          </th>

                          <th className="p-4">
                            Precio
                          </th>

                          <th className="p-4">
                            Cantidad
                          </th>

                          <th className="p-4">
                            Subtotal
                          </th>

                          <th className="p-4">
                            Acción
                          </th>
                        </tr>

                      </thead>

                      <tbody>

                        {carrito.map(
                          (item) => {

                            const precio =
                              obtenerPrecio(
                                item.producto
                              )

                            return (
                              <tr
                                key={
                                  item.producto.id
                                }
                                className="border-t"
                              >

                                <td className="p-4 font-semibold">
                                  {item.producto.nombre}
                                </td>

                                <td className="p-4 text-center">
                                  $
                                  {precio.toLocaleString(
                                    'es-AR'
                                  )}
                                </td>

                                <td className="p-4">

                                  <div className="flex justify-center items-center gap-2">

                                    <button
                                      onClick={() =>
                                        cambiarCantidad(
                                          item.producto.id,
                                          item.cantidad - 1
                                        )
                                      }
                                      className="border w-9 h-9 rounded-lg"
                                    >
                                      -
                                    </button>

                                    <span className="w-10 text-center font-bold">
                                      {item.cantidad}
                                    </span>

                                    <button
                                      onClick={() =>
                                        cambiarCantidad(
                                          item.producto.id,
                                          item.cantidad + 1
                                        )
                                      }
                                      className="border w-9 h-9 rounded-lg"
                                    >
                                      +
                                    </button>

                                  </div>

                                </td>

                                <td className="p-4 text-center font-bold">
                                  $
                                  {(
                                    precio *
                                    item.cantidad
                                  ).toLocaleString(
                                    'es-AR'
                                  )}
                                </td>

                                <td className="p-4 text-center">

                                  <button
                                    onClick={() =>
                                      cambiarCantidad(
                                        item.producto.id,
                                        0
                                      )
                                    }
                                    className="text-red-600"
                                  >
                                    Quitar
                                  </button>

                                </td>

                              </tr>
                            )
                          }
                        )}

                      </tbody>

                    </table>

                    {carrito.length ===
                      0 && (

                      <div className="p-10 text-center text-slate-500">
                        No hay productos en la venta.
                      </div>

                    )}

                  </div>

                </div>

                <div className="bg-white border rounded-2xl p-6 h-fit">

                  <h4 className="text-2xl font-bold">
                    Resumen
                  </h4>

                  <label className="font-semibold block mt-5 mb-2">
                    Cliente
                  </label>

                  <select
                    value={
                      clienteVenta
                    }
                    onChange={(e) =>
                      cambiarClienteVenta(
                        e.target.value
                      )
                    }
                    className="w-full border px-4 py-3 rounded-xl"
                  >

                    <option value="">
                      Consumidor final
                    </option>

                    {clientes.map(
                      (cliente) => (

                        <option
                          key={cliente.id}
                          value={cliente.id}
                        >
                          {cliente.nombre} - {cliente.tipo_cliente}
                        </option>

                      )
                    )}

                  </select>

                  <label className="font-semibold block mt-5 mb-2">
                    Tipo de venta
                  </label>

                  <select
                    value={tipoVenta}
                    onChange={(e) =>
                      setTipoVenta(
                        e.target.value as TipoVenta
                      )
                    }
                    className="w-full border px-4 py-3 rounded-xl"
                  >

                    <option value="MINORISTA">
                      Minorista
                    </option>

                    <option value="MAYORISTA">
                      Mayorista
                    </option>

                  </select>

                  <label className="font-semibold block mt-5 mb-2">
                    Forma de pago
                  </label>

                  <select
                    value={formaPago}
                    onChange={(e) =>
                      setFormaPago(
                        e.target.value as FormaPago
                      )
                    }
                    className="w-full border px-4 py-3 rounded-xl"
                  >

                    <option value="EFECTIVO">
                      Efectivo
                    </option>

                    <option value="TRANSFERENCIA">
                      Transferencia
                    </option>

                    <option value="DEBITO">
                      Débito
                    </option>

                    <option value="CREDITO">
                      Crédito
                    </option>

                    <option value="OTRO">
                      Otro
                    </option>

                  </select>

                  <label className="font-semibold block mt-5 mb-2">
                    Descuento
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={descuento}
                    onChange={(e) =>
                      setDescuento(
                        e.target.value
                      )
                    }
                    className="w-full border px-4 py-3 rounded-xl"
                  />

                  <div className="border-t mt-6 pt-5 space-y-3">

                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <strong>
                        ${subtotalVenta.toLocaleString('es-AR')}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Descuento</span>
                      <span>
                        -${descuentoNumero.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex justify-between text-2xl font-bold border-t pt-4">
                      <span>TOTAL</span>
                      <span>
                        ${totalVenta.toLocaleString('es-AR')}
                      </span>
                    </div>

                  </div>

                  <button
                    onClick={
                      confirmarVenta
                    }
                    disabled={
                      guardandoVenta ||
                      carrito.length === 0
                    }
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-6 disabled:opacity-40"
                  >
                    {guardandoVenta
                      ? 'Registrando...'
                      : 'Confirmar venta'}
                  </button>

                </div>

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* CLIENTES */}
          {/* ================================================= */}

          {seccionActual ===
            'Clientes' && (

            <div>

              <div className="flex justify-between">

                <div>
                  <h3 className="text-3xl font-bold">
                    Clientes
                  </h3>
                  <p className="text-slate-500">
                    Clientes minoristas y mayoristas.
                  </p>
                </div>

                <button
                  onClick={
                    nuevoCliente
                  }
                  className="bg-slate-900 text-white px-5 py-3 rounded-xl"
                >
                  + Nuevo cliente
                </button>

              </div>

              {mostrarFormularioCliente && (

                <form
                  onSubmit={
                    guardarCliente
                  }
                  className="bg-white border p-6 rounded-2xl mt-6 grid md:grid-cols-2 gap-4"
                >

                  <input
                    required
                    placeholder="Nombre"
                    value={
                      formularioCliente.nombre
                    }
                    onChange={(e) =>
                      setFormularioCliente({
                        ...formularioCliente,
                        nombre:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <input
                    placeholder="DNI / CUIT"
                    value={
                      formularioCliente.dni_cuit
                    }
                    onChange={(e) =>
                      setFormularioCliente({
                        ...formularioCliente,
                        dni_cuit:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <input
                    placeholder="Teléfono"
                    value={
                      formularioCliente.telefono
                    }
                    onChange={(e) =>
                      setFormularioCliente({
                        ...formularioCliente,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <input
                    placeholder="Dirección"
                    value={
                      formularioCliente.direccion
                    }
                    onChange={(e) =>
                      setFormularioCliente({
                        ...formularioCliente,
                        direccion:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <select
                    value={
                      formularioCliente.tipo_cliente
                    }
                    onChange={(e) =>
                      setFormularioCliente({
                        ...formularioCliente,
                        tipo_cliente:
                          e.target.value as TipoVenta,
                      })
                    }
                    className="border p-3 rounded-xl"
                  >
                    <option value="MINORISTA">
                      Minorista
                    </option>
                    <option value="MAYORISTA">
                      Mayorista
                    </option>
                  </select>

                  <div className="md:col-span-2 flex gap-3">

                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl">
                      Guardar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarFormularioCliente(
                          false
                        )
                      }
                      className="border px-6 py-3 rounded-xl"
                    >
                      Cancelar
                    </button>

                  </div>

                </form>

              )}

              <input
                value={
                  busquedaCliente
                }
                onChange={(e) =>
                  setBusquedaCliente(
                    e.target.value
                  )
                }
                placeholder="Buscar cliente..."
                className="border p-3 rounded-xl mt-6 w-full md:w-96"
              />

              <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr>
                      <th className="p-4 text-left">
                        Cliente
                      </th>
                      <th className="p-4 text-left">
                        DNI / CUIT
                      </th>
                      <th className="p-4 text-left">
                        Teléfono
                      </th>
                      <th className="p-4 text-left">
                        Tipo
                      </th>
                      <th className="p-4">
                        Acciones
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {clientesFiltrados.map(
                      (cliente) => (

                        <tr
                          key={cliente.id}
                          className="border-t"
                        >

                          <td className="p-4 font-semibold">
                            {cliente.nombre}
                          </td>

                          <td className="p-4">
                            {cliente.dni_cuit ||
                              '-'}
                          </td>

                          <td className="p-4">
                            {cliente.telefono ||
                              '-'}
                          </td>

                          <td className="p-4">
                            {cliente.tipo_cliente}
                          </td>

                          <td className="p-4">

                            <div className="flex justify-center gap-2">

                              <button
                                onClick={() =>
                                  editarCliente(
                                    cliente
                                  )
                                }
                                className="bg-slate-100 px-4 py-2 rounded-lg"
                              >
                                Editar
                              </button>

                              {usuarioLogueado.rol ===
                                'Administrador' && (

                                <button
                                  onClick={() =>
                                    eliminarCliente(
                                      cliente
                                    )
                                  }
                                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg"
                                >
                                  Eliminar
                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* PRODUCTOS */}
          {/* ================================================= */}

          {seccionActual ===
            'Productos' && (

            <div>

              <div className="flex justify-between">

                <div>

                  <h3 className="text-3xl font-bold">
                    Productos
                  </h3>

                  <p className="text-slate-500">
                    Catálogo, precios y existencias.
                  </p>

                </div>

                {usuarioLogueado.rol ===
                  'Administrador' && (

                  <button
                    onClick={
                      nuevoProducto
                    }
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl"
                  >
                    + Nuevo producto
                  </button>

                )}

              </div>

              {mostrarFormularioProducto && (

                <form
                  onSubmit={
                    guardarProducto
                  }
                  className="bg-white border rounded-2xl p-6 mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >

                  {Object.keys(
                    formularioProducto
                  ).map((campo) => (

                    <input
                      key={campo}
                      value={
                        formularioProducto[
                          campo as keyof FormProducto
                        ]
                      }
                      onChange={(e) =>
                        setFormularioProducto({
                          ...formularioProducto,
                          [campo]:
                            e.target.value,
                        })
                      }
                      placeholder={
                        campo.replaceAll(
                          '_',
                          ' '
                        )
                      }
                      className="border p-3 rounded-xl"
                    />

                  ))}

                  <button className="bg-slate-900 text-white p-3 rounded-xl">
                    Guardar producto
                  </button>

                </form>

              )}

              <input
                value={
                  busquedaProducto
                }
                onChange={(e) =>
                  setBusquedaProducto(
                    e.target.value
                  )
                }
                placeholder="Buscar producto..."
                className="border p-3 rounded-xl mt-6 w-full md:w-96"
              />

              <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr>
                      <th className="p-4 text-left">
                        Código
                      </th>
                      <th className="p-4 text-left">
                        Producto
                      </th>
                      <th className="p-4">
                        Minorista
                      </th>
                      <th className="p-4">
                        Mayorista
                      </th>
                      <th className="p-4">
                        Stock
                      </th>
                      <th className="p-4">
                        Acción
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {productosFiltrados.map(
                      (producto) => (

                        <tr
                          key={producto.id}
                          className="border-t"
                        >

                          <td className="p-4">
                            {producto.codigo_barras}
                          </td>

                          <td className="p-4 font-semibold">
                            {producto.nombre}
                          </td>

                          <td className="p-4 text-center">
                            $
                            {Number(
                              producto.precio_minorista
                            ).toLocaleString(
                              'es-AR'
                            )}
                          </td>

                          <td className="p-4 text-center">
                            $
                            {Number(
                              producto.precio_mayorista
                            ).toLocaleString(
                              'es-AR'
                            )}
                          </td>

                          <td className="p-4 text-center">
                            {producto.stock}
                          </td>

                          <td className="p-4 text-center">

                            {usuarioLogueado.rol ===
                              'Administrador' && (

                              <button
                                onClick={() =>
                                  editarProducto(
                                    producto
                                  )
                                }
                                className="bg-slate-100 px-4 py-2 rounded-lg"
                              >
                                Editar
                              </button>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* STOCK */}
          {/* ================================================= */}

          {seccionActual ===
            'Stock' && (

            <div>

              <h3 className="text-3xl font-bold">
                Control de stock
              </h3>

              <div className="grid xl:grid-cols-3 gap-6 mt-6">

                <form
                  onSubmit={
                    registrarMovimiento
                  }
                  className="bg-white border rounded-2xl p-6 space-y-4"
                >

                  <select
                    value={
                      formularioMovimiento.producto_id
                    }
                    onChange={(e) =>
                      setFormularioMovimiento({
                        ...formularioMovimiento,
                        producto_id:
                          e.target.value,
                      })
                    }
                    className="w-full border p-3 rounded-xl"
                  >

                    <option value="">
                      Producto
                    </option>

                    {productos.map(
                      (producto) => (

                        <option
                          key={producto.id}
                          value={producto.id}
                        >
                          {producto.nombre}
                        </option>

                      )
                    )}

                  </select>

                  {productoStockSeleccionado && (

                    <div className="bg-slate-100 p-4 rounded-xl">

                      Stock actual:{' '}

                      <strong>
                        {productoStockSeleccionado.stock}
                      </strong>

                    </div>

                  )}

                  <select
                    value={
                      formularioMovimiento.tipo
                    }
                    onChange={(e) =>
                      setFormularioMovimiento({
                        ...formularioMovimiento,
                        tipo:
                          e.target.value as TipoMovimiento,
                      })
                    }
                    className="w-full border p-3 rounded-xl"
                  >

                    <option value="ENTRADA">
                      Entrada
                    </option>

                    <option value="SALIDA">
                      Salida
                    </option>

                    <option value="AJUSTE">
                      Ajuste
                    </option>

                  </select>

                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={
                      formularioMovimiento.cantidad
                    }
                    onChange={(e) =>
                      setFormularioMovimiento({
                        ...formularioMovimiento,
                        cantidad:
                          e.target.value,
                      })
                    }
                    className="w-full border p-3 rounded-xl"
                  />

                  <input
                    placeholder="Motivo"
                    value={
                      formularioMovimiento.motivo
                    }
                    onChange={(e) =>
                      setFormularioMovimiento({
                        ...formularioMovimiento,
                        motivo:
                          e.target.value,
                      })
                    }
                    className="w-full border p-3 rounded-xl"
                  />

                  <button className="w-full bg-slate-900 text-white p-3 rounded-xl">
                    Registrar movimiento
                  </button>

                </form>

                <div className="xl:col-span-2 bg-white border rounded-2xl p-6">

                  <input
                    value={
                      busquedaStock
                    }
                    onChange={(e) =>
                      setBusquedaStock(
                        e.target.value
                      )
                    }
                    placeholder="Buscar producto..."
                    className="border p-3 rounded-xl mb-4"
                  />

                  {productosStock.map(
                    (producto) => (

                      <div
                        key={producto.id}
                        className="flex justify-between border-b py-3"
                      >

                        <span className="font-semibold">
                          {producto.nombre}
                        </span>

                        <span>
                          Stock: {producto.stock}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              <div className="bg-white border rounded-2xl p-6 mt-6">

                <h4 className="text-xl font-bold mb-4">
                  Historial de movimientos
                </h4>

                {movimientos.map(
                  (movimiento) => (

                    <div
                      key={movimiento.id}
                      className="grid grid-cols-4 gap-3 border-b py-3"
                    >

                      <span>
                        {movimiento.producto}
                      </span>

                      <span>
                        {movimiento.tipo}
                      </span>

                      <span>
                        {movimiento.cantidad}
                      </span>

                      <span>
                        {movimiento.stock_anterior}
                        {' → '}
                        {movimiento.stock_nuevo}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

{/* ================================================= */}
{/* PROVEEDORES */}
{/* ================================================= */}

{seccionActual ===
  'Proveedores' && (

  <div>

    <div className="flex justify-between items-center">

      <div>

        <h3 className="text-3xl font-bold">
          Proveedores
        </h3>

        <p className="text-slate-500">
          Administrá los proveedores de la distribuidora.
        </p>

      </div>

      <button
        onClick={
          nuevoProveedor
        }
        className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
      >
        + Nuevo proveedor
      </button>

    </div>

    {mostrarFormularioProveedor && (

      <form
        onSubmit={
          guardarProveedor
        }
        className="bg-white border rounded-2xl p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
      >

        <div>

          <label className="font-semibold block mb-2">
            Nombre
          </label>

          <input
            required
            value={
              formularioProveedor.nombre
            }
            onChange={(e) =>
              setFormularioProveedor({
                ...formularioProveedor,
                nombre:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            CUIT
          </label>

          <input
            value={
              formularioProveedor.cuit
            }
            onChange={(e) =>
              setFormularioProveedor({
                ...formularioProveedor,
                cuit:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            Teléfono
          </label>

          <input
            value={
              formularioProveedor.telefono
            }
            onChange={(e) =>
              setFormularioProveedor({
                ...formularioProveedor,
                telefono:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            Email
          </label>

          <input
            type="email"
            value={
              formularioProveedor.email
            }
            onChange={(e) =>
              setFormularioProveedor({
                ...formularioProveedor,
                email:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div className="md:col-span-2">

          <label className="font-semibold block mb-2">
            Dirección
          </label>

          <input
            value={
              formularioProveedor.direccion
            }
            onChange={(e) =>
              setFormularioProveedor({
                ...formularioProveedor,
                direccion:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div className="md:col-span-2 flex gap-3">

          <button
            className="bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
            {proveedorEditando
              ? 'Guardar cambios'
              : 'Crear proveedor'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMostrarFormularioProveedor(
                false
              )

              setProveedorEditando(
                null
              )
            }}
            className="border px-6 py-3 rounded-xl"
          >
            Cancelar
          </button>

        </div>

      </form>

    )}

    <div className="bg-white border rounded-2xl p-5 mt-6">

      <input
        value={
          busquedaProveedor
        }
        onChange={(e) =>
          setBusquedaProveedor(
            e.target.value
          )
        }
        placeholder="Buscar proveedor..."
        className="border px-4 py-3 rounded-xl w-full md:w-96"
      />

    </div>

    <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">
              Proveedor
            </th>

            <th className="p-4 text-left">
              CUIT
            </th>

            <th className="p-4 text-left">
              Teléfono
            </th>

            <th className="p-4 text-left">
              Dirección
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4">
              Acciones
            </th>

          </tr>

        </thead>

        <tbody>

          {proveedoresFiltrados.map(
            (proveedor) => (

              <tr
                key={
                  proveedor.id
                }
                className="border-t"
              >

                <td className="p-4 font-semibold">
                  {
                    proveedor.nombre
                  }
                </td>

                <td className="p-4">
                  {proveedor.cuit ||
                    '-'}
                </td>

                <td className="p-4">
                  {proveedor.telefono ||
                    '-'}
                </td>

                <td className="p-4">
                  {proveedor.direccion ||
                    '-'}
                </td>

                <td className="p-4">
                  {proveedor.email ||
                    '-'}
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() =>
                        editarProveedor(
                          proveedor
                        )
                      }
                      className="bg-slate-100 px-4 py-2 rounded-lg font-semibold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        eliminarProveedor(
                          proveedor
                        )
                      }
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

      {proveedoresFiltrados.length ===
        0 && (

        <div className="p-10 text-center text-slate-500">
          No hay proveedores registrados.
        </div>

      )}

    </div>

  </div>

)}

{/* ================================================= */}
{/* COMPRAS */}
{/* ================================================= */}

{seccionActual ===
  'Compras' && (

  <div>

    <div>

      <h3 className="text-3xl font-bold">
        Compras
      </h3>

      <p className="text-slate-500">
        Registrá mercadería recibida y actualizá el stock.
      </p>

    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

      {/* IZQUIERDA */}

      <div className="xl:col-span-2 space-y-5">

        <div className="bg-white border rounded-2xl p-6">

          <h4 className="text-xl font-bold">
            Nueva compra
          </h4>

          <div className="grid md:grid-cols-2 gap-4 mt-5">

            <div>

              <label className="font-semibold block mb-2">
                Proveedor
              </label>

              <select
                value={
                  proveedorCompra
                }
                onChange={(e) =>
                  setProveedorCompra(
                    e.target.value
                  )
                }
                className="w-full border px-4 py-3 rounded-xl"
              >

                <option value="">
                  Sin proveedor
                </option>

                {proveedores.map(
                  (proveedor) => (

                    <option
                      key={
                        proveedor.id
                      }
                      value={
                        proveedor.id
                      }
                    >
                      {
                        proveedor.nombre
                      }
                    </option>

                  )
                )}

              </select>

            </div>

            <div>

              <label className="font-semibold block mb-2">
                Producto
              </label>

              <select
                value={
                  productoCompra
                }
                onChange={(e) =>
                  seleccionarProductoCompra(
                    e.target.value
                  )
                }
                className="w-full border px-4 py-3 rounded-xl"
              >

                <option value="">
                  Seleccionar producto
                </option>

                {productos.map(
                  (producto) => (

                    <option
                      key={
                        producto.id
                      }
                      value={
                        producto.id
                      }
                    >
                      {
                        producto.nombre
                      }
                    </option>

                  )
                )}

              </select>

            </div>

            <div>

              <label className="font-semibold block mb-2">
                Cantidad
              </label>

              <input
                type="number"
                min="1"
                value={
                  cantidadCompra
                }
                onChange={(e) =>
                  setCantidadCompra(
                    e.target.value
                  )
                }
                className="w-full border px-4 py-3 rounded-xl"
              />

            </div>

            <div>

              <label className="font-semibold block mb-2">
                Precio de compra
              </label>

              <input
                type="number"
                min="0"
                value={
                  precioCompra
                }
                onChange={(e) =>
                  setPrecioCompra(
                    e.target.value
                  )
                }
                className="w-full border px-4 py-3 rounded-xl"
              />

            </div>

          </div>

          <button
            type="button"
            onClick={
              agregarProductoCompra
            }
            className="bg-slate-900 text-white px-6 py-3 rounded-xl mt-5"
          >
            + Agregar producto
          </button>

        </div>

        {/* DETALLE */}

        <div className="bg-white border rounded-2xl overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Producto
                </th>

                <th className="p-4">
                  Cantidad
                </th>

                <th className="p-4">
                  Costo
                </th>

                <th className="p-4">
                  Subtotal
                </th>

                <th className="p-4">
                  Acción
                </th>

              </tr>

            </thead>

            <tbody>

              {carritoCompra.map(
                (item) => (

                  <tr
                    key={
                      item.producto.id
                    }
                    className="border-t"
                  >

                    <td className="p-4">

                      <p className="font-semibold">
                        {
                          item.producto.nombre
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        Stock actual: {item.producto.stock}
                      </p>

                    </td>

                    <td className="p-4">

                      <input
                        type="number"
                        min="1"
                        value={
                          item.cantidad
                        }
                        onChange={(e) =>
                          cambiarCantidadCompra(
                            item.producto.id,
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-24 border px-3 py-2 rounded-lg mx-auto block"
                      />

                    </td>

                    <td className="p-4">

                      <input
                        type="number"
                        min="0"
                        value={
                          item.precio_compra
                        }
                        onChange={(e) =>
                          cambiarPrecioCompra(
                            item.producto.id,
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-32 border px-3 py-2 rounded-lg mx-auto block"
                      />

                    </td>

                    <td className="p-4 text-center font-bold">
                      $
                      {(
                        item.cantidad *
                        item.precio_compra
                      ).toLocaleString(
                        'es-AR'
                      )}
                    </td>

                    <td className="p-4 text-center">

                      <button
                        onClick={() =>
                          eliminarProductoCompra(
                            item.producto.id
                          )
                        }
                        className="text-red-600 font-semibold"
                      >
                        Quitar
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {carritoCompra.length ===
            0 && (

            <div className="p-10 text-center text-slate-500">
              Todavía no agregaste productos.
            </div>

          )}

        </div>

      </div>

      {/* RESUMEN */}

      <div className="bg-white border rounded-2xl p-6 h-fit">

        <h4 className="text-2xl font-bold">
          Resumen
        </h4>

        <div className="mt-5">

          <label className="font-semibold block mb-2">
            Observación
          </label>

          <textarea
            value={
              observacionCompra
            }
            onChange={(e) =>
              setObservacionCompra(
                e.target.value
              )
            }
            placeholder="Ej: Pedido Pepsi semanal"
            className="w-full border px-4 py-3 rounded-xl min-h-28"
          />

        </div>

        <div className="border-t mt-6 pt-5">

          <div className="flex justify-between">

            <span>
              Productos
            </span>

            <strong>
              {
                carritoCompra.length
              }
            </strong>

          </div>

          <div className="flex justify-between text-2xl font-bold mt-5 border-t pt-5">

            <span>
              TOTAL
            </span>

            <span>
              $
              {totalCompra.toLocaleString(
                'es-AR'
              )}
            </span>

          </div>

        </div>

        <button
          onClick={
            confirmarCompra
          }
          disabled={
            guardandoCompra ||
            carritoCompra.length === 0
          }
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-6 disabled:opacity-40"
        >
          {guardandoCompra
            ? 'Registrando...'
            : 'Confirmar compra'}
        </button>

      </div>

    </div>

    {/* HISTORIAL */}

    <div className="bg-white border rounded-2xl mt-6 overflow-x-auto">

      <div className="p-5 border-b">

        <h4 className="text-xl font-bold">
          Historial de compras
        </h4>

      </div>

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">
              Compra
            </th>

            <th className="p-4 text-left">
              Proveedor
            </th>

            <th className="p-4 text-left">
              Usuario
            </th>

            <th className="p-4 text-left">
              Total
            </th>

            <th className="p-4 text-left">
              Fecha
            </th>

          </tr>

        </thead>

        <tbody>

          {compras
            .slice(0, 15)
            .map(
              (compra) => (

                <tr
                  key={
                    compra.id
                  }
                  className="border-t"
                >

                  <td className="p-4 font-bold">
                    #{compra.id}
                  </td>

                  <td className="p-4">
                    {compra.proveedor ||
                      'Sin proveedor'}
                  </td>

                  <td className="p-4">
                    {
                      compra.usuario
                    }
                  </td>

                  <td className="p-4 font-bold">
                    $
                    {Number(
                      compra.total
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </td>

                  <td className="p-4">
                    {new Date(
                      compra.fecha
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </td>

                </tr>

              )
            )}

        </tbody>

      </table>

      {compras.length === 0 && (

        <div className="p-10 text-center text-slate-500">
          Todavía no hay compras registradas.
        </div>

      )}

    </div>

  </div>

)}
{/* ================================================= */}
{/* PRECIOS */}
{/* ================================================= */}

{seccionActual ===
  'Precios' && (

  <div>

    <div>

      <h3 className="text-3xl font-bold">
        Precios
      </h3>

      <p className="text-slate-500">
        Actualizá costos, precios de venta y controlá los márgenes.
      </p>

    </div>

    {/* BUSCADOR */}

    <div className="bg-white border rounded-2xl p-5 mt-6">

      <input
        value={
          busquedaPrecio
        }
        onChange={(e) =>
          setBusquedaPrecio(
            e.target.value
          )
        }
        placeholder="Buscar producto..."
        className="border px-4 py-3 rounded-xl w-full md:w-96"
      />

    </div>

    {/* TABLA */}

    <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">
              Producto
            </th>

            <th className="p-4">
              Costo
            </th>

            <th className="p-4">
              Minorista
            </th>

            <th className="p-4">
              Margen
            </th>

            <th className="p-4">
              Mayorista
            </th>

            <th className="p-4">
              Margen
            </th>

            <th className="p-4">
              Acción
            </th>

          </tr>

        </thead>

        <tbody>

          {productosPrecioFiltrados.map(
            (producto) => {

              const costo =
                Number(
                  obtenerPrecioCampo(
                    producto,
                    'precio_compra'
                  )
                ) || 0

              const minorista =
                Number(
                  obtenerPrecioCampo(
                    producto,
                    'precio_minorista'
                  )
                ) || 0

              const mayorista =
                Number(
                  obtenerPrecioCampo(
                    producto,
                    'precio_mayorista'
                  )
                ) || 0

              const margenMinorista =
                calcularMargen(
                  costo,
                  minorista
                )

              const margenMayorista =
                calcularMargen(
                  costo,
                  mayorista
                )

              const tieneCambios =
                Boolean(
                  preciosEditables[
                    producto.id
                  ]
                )

              return (

                <tr
                  key={
                    producto.id
                  }
                  className="border-t"
                >

                  {/* PRODUCTO */}

                  <td className="p-4">

                    <p className="font-bold">
                      {
                        producto.nombre
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {producto.presentacion ||
                        'Sin presentación'}
                    </p>

                    <p className="text-xs text-slate-400">
                      {producto.codigo_barras ||
                        'Sin código'}
                    </p>

                  </td>

                  {/* COSTO */}

                  <td className="p-4">

                    <input
                      type="number"
                      min="0"
                      value={
                        obtenerPrecioCampo(
                          producto,
                          'precio_compra'
                        )
                      }
                      onChange={(e) =>
                        cambiarPrecio(
                          producto,
                          'precio_compra',
                          e.target.value
                        )
                      }
                      className="w-32 border px-3 py-2 rounded-lg"
                    />

                  </td>

                  {/* MINORISTA */}

                  <td className="p-4">

                    <input
                      type="number"
                      min="0"
                      value={
                        obtenerPrecioCampo(
                          producto,
                          'precio_minorista'
                        )
                      }
                      onChange={(e) =>
                        cambiarPrecio(
                          producto,
                          'precio_minorista',
                          e.target.value
                        )
                      }
                      className="w-32 border px-3 py-2 rounded-lg"
                    />

                  </td>

                  {/* MARGEN MINORISTA */}

                  <td className="p-4 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        margenMinorista >
                        0
                          ? 'bg-green-100 text-green-700'
                          : margenMinorista <
                            0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {margenMinorista.toFixed(
                        1
                      )}
                      %
                    </span>

                  </td>

                  {/* MAYORISTA */}

                  <td className="p-4">

                    <input
                      type="number"
                      min="0"
                      value={
                        obtenerPrecioCampo(
                          producto,
                          'precio_mayorista'
                        )
                      }
                      onChange={(e) =>
                        cambiarPrecio(
                          producto,
                          'precio_mayorista',
                          e.target.value
                        )
                      }
                      className="w-32 border px-3 py-2 rounded-lg"
                    />

                  </td>

                  {/* MARGEN MAYORISTA */}

                  <td className="p-4 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        margenMayorista >
                        0
                          ? 'bg-blue-100 text-blue-700'
                          : margenMayorista <
                            0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {margenMayorista.toFixed(
                        1
                      )}
                      %
                    </span>

                  </td>

                  {/* GUARDAR */}

                  <td className="p-4 text-center">

                    <button
                      disabled={
                        !tieneCambios
                      }
                      onClick={() =>
                        guardarPreciosProducto(
                          producto
                        )
                      }
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        tieneCambios
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      Guardar
                    </button>

                  </td>

                </tr>

              )
            }
          )}

        </tbody>

      </table>

      {productosPrecioFiltrados.length ===
        0 && (

        <div className="p-10 text-center text-slate-500">
          No se encontraron productos.
        </div>

      )}

    </div>

  </div>

)}
          {/* ================================================= */}
          {/* REPORTES */}
          {/* ================================================= */}

{seccionActual ===
  'Reportes' && (

  <div>

    <div>

      <h3 className="text-3xl font-bold">
        Reportes
      </h3>

      <p className="text-slate-500">
        Analizá ventas, compras, formas de pago y stock.
      </p>

    </div>

    {/* FILTROS */}

    <div className="bg-white border rounded-2xl p-5 mt-6">

      <div className="flex flex-col md:flex-row gap-4 items-end">

        <div>

          <label className="font-semibold block mb-2">
            Desde
          </label>

          <input
            type="date"
            value={
              reporteDesde
            }
            onChange={(e) =>
              setReporteDesde(
                e.target.value
              )
            }
            className="border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            Hasta
          </label>

          <input
            type="date"
            value={
              reporteHasta
            }
            onChange={(e) =>
              setReporteHasta(
                e.target.value
              )
            }
            className="border px-4 py-3 rounded-xl"
          />

        </div>

        <button
          onClick={() =>
            cargarReporte()
          }
          disabled={
            cargandoReporte
          }
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {cargandoReporte
            ? 'Cargando...'
            : 'Generar reporte'}
        </button>

      </div>

    </div>

    {reporte && (

      <>

        {/* TARJETAS */}

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">

  <div className="bg-white border rounded-2xl p-6">

    <p className="text-slate-500">
      Ventas
    </p>

    <p className="text-3xl font-bold mt-1">
      $
      {Number(
        reporte.ventas.total
      ).toLocaleString(
        'es-AR'
      )}
    </p>

    <p className="text-sm text-slate-500 mt-2">
      {reporte.ventas.cantidad} ventas
    </p>

  </div>

  <div className="bg-white border rounded-2xl p-6">

    <p className="text-slate-500">
      Costo vendido
    </p>

    <p className="text-3xl font-bold mt-1">
      $
      {Number(
        reporte.rentabilidad
          .costo_vendido
      ).toLocaleString(
        'es-AR'
      )}
    </p>

    <p className="text-xs text-slate-400 mt-2">
      Costo histórico de lo vendido
    </p>

  </div>

  <div className="bg-white border rounded-2xl p-6">

    <p className="text-slate-500">
      Ganancia bruta
    </p>

    <p
      className={`text-3xl font-bold mt-1 ${
        reporte.rentabilidad
          .ganancia_bruta >= 0
          ? 'text-green-700'
          : 'text-red-700'
      }`}
    >
      $
      {Number(
        reporte.rentabilidad
          .ganancia_bruta
      ).toLocaleString(
        'es-AR'
      )}
    </p>

    <p className="text-xs text-slate-400 mt-2">
      Venta menos costo vendido
    </p>

  </div>

  <div className="bg-white border rounded-2xl p-6">

    <p className="text-slate-500">
      Margen
    </p>

    <p
      className={`text-3xl font-bold mt-1 ${
        reporte.rentabilidad
          .margen >= 0
          ? 'text-blue-700'
          : 'text-red-700'
      }`}
    >
      {Number(
        reporte.rentabilidad
          .margen
      ).toFixed(1)}
      %
    </p>

    <p className="text-xs text-slate-400 mt-2">
      Sobre ventas del período
    </p>

  </div>

</div>

        {/* PRODUCTOS + FORMAS DE PAGO */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

          <div className="bg-white border rounded-2xl overflow-hidden">

            <div className="p-5 border-b">

              <h4 className="text-xl font-bold">
                Productos más vendidos
              </h4>

            </div>

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">
                    Producto
                  </th>

                  <th className="p-3 text-center">
                    Cantidad
                  </th>

                  <th className="p-3 text-right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {reporte.productos_mas_vendidos.map(
                  (producto) => (

                    <tr
                      key={
                        producto.id
                      }
                      className="border-t"
                    >

                      <td className="p-3">

                        <p className="font-semibold">
                          {
                            producto.nombre
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          {
                            producto.presentacion
                          }
                        </p>

                      </td>

                      <td className="p-3 text-center font-bold">
                        {
                          producto.cantidad_vendida
                        }
                      </td>

                      <td className="p-3 text-right font-bold">
                        $
                        {Number(
                          producto.total_vendido
                        ).toLocaleString(
                          'es-AR'
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

            {reporte.productos_mas_vendidos.length ===
              0 && (

              <div className="p-8 text-center text-slate-500">
                No hubo ventas en este período.
              </div>

            )}

          </div>

          <div className="bg-white border rounded-2xl overflow-hidden">

            <div className="p-5 border-b">

              <h4 className="text-xl font-bold">
                Formas de pago
              </h4>

            </div>

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">
                    Forma
                  </th>

                  <th className="p-3 text-center">
                    Ventas
                  </th>

                  <th className="p-3 text-right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {reporte.ventas_por_pago.map(
                  (pago) => (

                    <tr
                      key={
                        pago.forma_pago
                      }
                      className="border-t"
                    >

                      <td className="p-3 font-semibold">
                        {
                          pago.forma_pago
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          pago.cantidad
                        }
                      </td>

                      <td className="p-3 text-right font-bold">
                        $
                        {Number(
                          pago.total
                        ).toLocaleString(
                          'es-AR'
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ================================================= */}
        {/* PRODUCTOS MÁS RENTABLES */}
        {/* ================================================= */}

        <div className="bg-white border rounded-2xl mt-6 overflow-hidden">

          <div className="p-5 border-b">

            <h4 className="text-xl font-bold">
              Productos más rentables
            </h4>

            <p className="text-sm text-slate-500 mt-1">
              Productos ordenados por la ganancia generada en el período.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-4 text-left">
                    Producto
                  </th>

                  <th className="p-4 text-center">
                    Vendido
                  </th>

                  <th className="p-4 text-right">
                    Facturación
                  </th>

                  <th className="p-4 text-right">
                    Costo
                  </th>

                  <th className="p-4 text-right">
                    Ganancia
                  </th>

                </tr>

              </thead>

              <tbody>

                {reporte.productos_mas_rentables.map(
                  (producto) => (

                    <tr
                      key={producto.id}
                      className="border-t"
                    >

                      <td className="p-4">

                        <p className="font-semibold">
                          {producto.nombre}
                        </p>

                        <p className="text-xs text-slate-500">
                          {producto.presentacion ||
                            'Sin presentación'}
                        </p>

                      </td>

                      <td className="p-4 text-center font-bold">
                        {producto.cantidad_vendida}
                      </td>

                      <td className="p-4 text-right">
                        $
                        {Number(
                          producto.total_vendido
                        ).toLocaleString(
                          'es-AR'
                        )}
                      </td>

                      <td className="p-4 text-right">
                        $
                        {Number(
                          producto.costo_total
                        ).toLocaleString(
                          'es-AR'
                        )}
                      </td>

                      <td
                        className={`p-4 text-right font-bold ${
                          Number(
                            producto.ganancia
                          ) >= 0
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        $
                        {Number(
                          producto.ganancia
                        ).toLocaleString(
                          'es-AR'
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {reporte.productos_mas_rentables.length ===
            0 && (

            <div className="p-10 text-center text-slate-500">
              No hay datos de rentabilidad para este período.
            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* VENTAS POR DIA */}
        {/* ================================================= */}


        <div className="bg-white border rounded-2xl mt-6 overflow-hidden">

          <div className="p-5 border-b">

            <h4 className="text-xl font-bold">
              Ventas por día
            </h4>

          </div>

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Fecha
                </th>

                <th className="p-4 text-center">
                  Cantidad de ventas
                </th>

                <th className="p-4 text-right">
                  Total vendido
                </th>

              </tr>

            </thead>

            <tbody>

              {reporte.ventas_por_dia.map(
                (dia) => (

                  <tr
                    key={
                      dia.fecha
                    }
                    className="border-t"
                  >

                    <td className="p-4">
                      {new Date(
                        `${dia.fecha}T00:00:00`
                      ).toLocaleDateString(
                        'es-AR'
                      )}
                    </td>

                    <td className="p-4 text-center font-bold">
                      {
                        dia.cantidad
                      }
                    </td>

                    <td className="p-4 text-right font-bold">
                      $
                      {Number(
                        dia.total
                      ).toLocaleString(
                        'es-AR'
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {/* STOCK BAJO */}

        <div className="bg-white border rounded-2xl mt-6 overflow-hidden">

          <div className="p-5 border-b">

            <h4 className="text-xl font-bold">
              Productos con stock bajo
            </h4>

          </div>

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Producto
                </th>

                <th className="p-4 text-center">
                  Stock
                </th>

                <th className="p-4 text-center">
                  Mínimo
                </th>

                <th className="p-4 text-center">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              {reporte.stock_bajo.map(
                (producto) => (

                  <tr
                    key={
                      producto.id
                    }
                    className="border-t"
                  >

                    <td className="p-4">

                      <p className="font-semibold">
                        {
                          producto.nombre
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        {
                          producto.presentacion
                        }
                      </p>

                    </td>

                    <td className="p-4 text-center font-bold">
                      {
                        producto.stock
                      }
                    </td>

                    <td className="p-4 text-center">
                      {
                        producto.stock_minimo
                      }
                    </td>

                    <td className="p-4 text-center">

                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                        REPONER
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {reporte.stock_bajo.length ===
            0 && (

            <div className="p-8 text-center text-slate-500">
              No hay productos con stock bajo.
            </div>

          )}

        </div>

      </>

    )}

  </div>

)}

          {/* ================================================= */}
          {/* CONFIGURACION */}
          {/* ================================================= */}

          {seccionActual ===
            'Configuracion' && (

            <div>

              <div>

                <h3 className="text-3xl font-bold">
                  Configuración
                </h3>

                <p className="text-slate-500 mt-1">
                  Datos generales de Hermanos del Norte.
                </p>

              </div>

              <form
                onSubmit={
                  guardarConfiguracion
                }
                className="bg-white border rounded-2xl p-6 mt-6 max-w-4xl"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="md:col-span-2">

                    <label className="font-semibold block mb-2">
                      Nombre de la empresa
                    </label>

                    <input
                      required
                      value={
                        configuracion.nombre_empresa
                      }
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          nombre_empresa:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      CUIT
                    </label>

                    <input
                      value={
                        configuracion.cuit
                      }
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          cuit:
                            e.target.value,
                        })
                      }
                      placeholder="Ej: 20-12345678-9"
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Teléfono
                    </label>

                    <input
                      value={
                        configuracion.telefono
                      }
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          telefono:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        configuracion.email
                      }
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          email:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Alias de pago
                    </label>

                    <input
                      value={
                        configuracion.alias_pago
                      }
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          alias_pago:
                            e.target.value,
                        })
                      }
                      placeholder="Alias para transferencias"
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="font-semibold block mb-2">
                      Dirección
                    </label>

                    <input
                      value={
                        configuracion.direccion
                      }
                      onChange={(e) =>
                        setConfiguracion({
                          ...configuracion,
                          direccion:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                </div>

                <div className="border-t mt-6 pt-6 flex items-center justify-between gap-4">

                  <div>

                    <p className="font-semibold">
                      Datos de la empresa
                    </p>

                    <p className="text-sm text-slate-500">
                      Más adelante estos datos se podrán usar en tickets y comprobantes.
                    </p>

                  </div>

                  <button
                    disabled={
                      guardandoConfiguracion
                    }
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {guardandoConfiguracion
                      ? 'Guardando...'
                      : 'Guardar configuración'}
                  </button>

                </div>

              </form>

            </div>

          )}

        </main>

      </div>

    </div>
  )
}



// =====================================================
// TARJETA DEL DASHBOARD
// =====================================================

function Tarjeta({
  titulo,
  valor,
}: {
  titulo: string
  valor: number
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">

      <p className="text-slate-500">
        {titulo}
      </p>

      <p className="text-3xl font-bold mt-1">
        {valor}
      </p>

    </div>
  )
}

export default App
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { API } from './config/api'
import Productos from './modulos/productos/Productos'
import Stock from './modulos/stock/Stock'
import Inicio from './modulos/inicio/Inicio'
import Empleados from './modulos/empleados/Empleados'
import Ventas from './modulos/ventas/Ventas'
import Pedidos from './modulos/pedidos/Pedidos'
import Clientes from './modulos/clientes/Clientes'
import Proveedores from './modulos/proveedores/Proveedores'
import Compras from './modulos/compras/Compras'
import Precios from './modulos/precios/Precios'
import Reportes from './modulos/reportes/Reportes'
import Configuracion from './modulos/configuracion/Configuracion'
import Login from './modulos/login/Login'
import Sidebar from './componentes/layout/Sidebar'
import Header from './componentes/layout/Header'
import {
  clienteVacio,
  empleadoVacio,
  movimientoVacio,
  permisos,
  productoVacio,
  proveedorVacio,
} from './constantes/sistema'
import type {
  CarritoItem,
  Cliente,
  Compra,
  ConfiguracionEmpresa,
  Empleado,
  FormaPago,
  FormCliente,
  FormEmpleado,
  FormMovimiento,
  FormProducto,
  FormProveedor,
  ItemCompra,
  MovimientoStock,
  PrecioEditable,
  Producto,
  Proveedor,
  ReporteResumen,
  RolBD,
  Seccion,
  TipoVenta,
  UsuarioSesion,
  Venta,
} from './tipos'

// =====
// APP
// =====
function App() {

  // ========================
  // CONFIGURACION - ESTADOS
  // ========================

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



  // ================
// REPORTES - ESTADOS
// ==================

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

  // ================
// PRECIOS - ESTADOS
// ===================

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

// =================
// COMPRAS - ESTADOS
// ==================

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

// =====================
// PROVEEDORES - ESTADOS
// =====================

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


  //=====
  // LOGIN
  // ====

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

  const [menuAbierto, setMenuAbierto] = useState(true)

  // ========
  // PRODUCTOS
  // ===========

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


  const [editandoStockMasivo, setEditandoStockMasivo] =
    useState(false)

  const [stockEditable, setStockEditable] =
    useState<Record<number, string>>({})

  const [guardandoStockMasivo, setGuardandoStockMasivo] =
    useState(false)

  const iniciarEdicionStockMasivo = () => {
    const valores: Record<number, string> = {}

    productos.forEach((producto) => {
      valores[producto.id] = String(producto.stock)
    })

    setStockEditable(valores)
    setEditandoStockMasivo(true)
  }

  const cancelarEdicionStockMasivo = () => {
    setEditandoStockMasivo(false)
    setStockEditable({})
  }

  const guardarStockMasivo = async () => {
    const cambios = productos.filter((producto) => {
      const nuevoValor = Number(stockEditable[producto.id])

      return (
        !Number.isNaN(nuevoValor) &&
        nuevoValor >= 0 &&
        nuevoValor !== Number(producto.stock)
      )
    })

    if (cambios.length === 0) {
      alert('No realizaste cambios en el stock')
      return
    }

    const hayValorInvalido = productos.some((producto) => {
      const valor = stockEditable[producto.id]
      if (valor === undefined) return false

      const numero = Number(valor)
      return Number.isNaN(numero) || numero < 0
    })

    if (hayValorInvalido) {
      alert('Revisá los valores ingresados. El stock no puede ser negativo.')
      return
    }

    if (!window.confirm(`¿Guardar ${cambios.length} cambios de stock?`)) {
      return
    }

    try {
      setGuardandoStockMasivo(true)

      for (const producto of cambios) {
        const respuesta = await fetch(`${API}/stock/movimiento`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            producto_id: producto.id,
            tipo: 'AJUSTE',
            cantidad: Number(stockEditable[producto.id]),
            motivo: 'Edición masiva de stock',
          }),
        })

        const datos = await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || `No se pudo actualizar ${producto.nombre}`)
        }
      }

      await cargarProductos()
      await cargarMovimientos()

      setEditandoStockMasivo(false)
      setStockEditable({})

      alert('Stock actualizado correctamente')
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el stock'
      )
    } finally {
      setGuardandoStockMasivo(false)
    }
  }

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

  const [, setVentas] =
    useState<Venta[]>([])

  const [
    guardandoVenta,
    setGuardandoVenta,
  ] = useState(false)

  const [ticketVenta, setTicketVenta] =
  useState<any | null>(null)

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
    Math.min(
      100,
      Math.max(
        0,
        Number(descuento) || 0
      )
    )

  const descuentoImporte =
    subtotalVenta *
    (descuentoNumero / 100)

  const totalVenta =
    Math.max(
      0,
      subtotalVenta -
        descuentoImporte
    )

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

const confirmarVenta = async (dineroRecibido = 0): Promise<boolean> => {
  if (carrito.length === 0) {
    await Swal.fire('Venta vacía', 'No hay productos en la venta.', 'warning')
    return false
  }

  const confirmacion = await Swal.fire({
    title: 'Finalizar compra',
    html: `Total de la venta: <b>$${totalVenta.toLocaleString('es-AR')}</b>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Finalizar venta',
    cancelButtonText: 'Cancelar',
  })

  if (!confirmacion.isConfirmed) return false

  try {
    setGuardandoVenta(true)

    const respuesta = await fetch(`${API}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuarioLogueado?.usuario,
        cliente_id: clienteVenta ? Number(clienteVenta) : null,
        tipo_venta: tipoVenta,
        forma_pago: formaPago,
        descuento: descuentoImporte,
        productos: carrito.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
        })),
      }),
    })

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      await Swal.fire('No se pudo registrar', datos.mensaje || 'No se pudo registrar la venta', 'error')
      return false
    }

    const clienteSeleccionado = clientes.find(
      (cliente) => cliente.id === Number(clienteVenta)
    )

    setTicketVenta({
      venta_id: datos.venta_id,
      fecha: new Date().toLocaleString('es-AR'),
      cliente: clienteSeleccionado?.nombre || 'Consumidor final',
      usuario: usuarioLogueado?.nombre || usuarioLogueado?.usuario || '',
      tipoVenta,
      formaPago,
      productos: carrito.map((item) => {
        const precio = obtenerPrecio(item.producto)
        return {
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          precio,
          subtotal: precio * item.cantidad,
        }
      }),
      subtotal: subtotalVenta,
      descuentoPorcentaje: descuentoNumero,
      descuentoImporte,
      total: totalVenta,
      dineroRecibido: formaPago === 'EFECTIVO' ? dineroRecibido : 0,
      vuelto:
        formaPago === 'EFECTIVO'
          ? Math.max(0, dineroRecibido - totalVenta)
          : 0,
    })

    setCarrito([])
    setClienteVenta('')
    setTipoVenta('MINORISTA')
    setFormaPago('EFECTIVO')
    setDescuento('0')
    setCodigoVenta('')

    await cargarProductos()
    await cargarMovimientos()
    await cargarVentas()
    await cargarReporte()

    return true
  } catch {
    await Swal.fire('Error', 'No se pudo registrar la venta.', 'error')
    return false
  } finally {
    setGuardandoVenta(false)
  }
}



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
      alert(
        datos.mensaje ||
          'No se pudo registrar la compra'
      )
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
      <Login
        usuario={usuario}
        setUsuario={setUsuario}
        password={password}
        setPassword={setPassword}
        mensaje={mensaje}
        iniciandoSesion={iniciandoSesion}
        iniciarSesion={iniciarSesion}
      />
    )
  }

  const seccionesPermitidas =
    permisos[
      usuarioLogueado.rol
    ]

  // ===================================================
  // CAJA DEL CAJERO EN PANTALLA EXCLUSIVA
  // ===================================================

  if (usuarioLogueado.rol === 'Cajero' && seccionActual === 'Ventas') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-slate-950 text-white px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-black text-lg">HERMANOS DEL NORTE · CAJA</div>
            <div className="text-sm text-slate-300">{usuarioLogueado.nombre}</div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSeccionActual('Inicio')} className="border border-slate-600 px-4 py-2 rounded-xl">Volver</button>
            <button type="button" onClick={cerrarSesion} className="bg-white text-slate-950 px-4 py-2 rounded-xl font-semibold">Cerrar sesión</button>
          </div>
        </div>
        <main className="p-4 sm:p-8 max-w-[1600px] mx-auto">
          <Ventas
            ticketVenta={ticketVenta}
            setTicketVenta={setTicketVenta}
            agregarProductoManual={agregarProductoManual}
            buscarCodigo={buscarCodigo}
            cambiarCantidad={cambiarCantidad}
            cambiarClienteVenta={cambiarClienteVenta}
            carrito={carrito}
            clienteVenta={clienteVenta}
            clientes={clientes}
            codigoVenta={codigoVenta}
            confirmarVenta={confirmarVenta}
            descuento={descuento}
            descuentoNumero={descuentoNumero}
            descuentoImporte={descuentoImporte}
            formaPago={formaPago}
            guardandoVenta={guardandoVenta}
            obtenerPrecio={obtenerPrecio}
            productoVentaSeleccionado={productoVentaSeleccionado}
            productos={productos}
            setCodigoVenta={setCodigoVenta}
            setDescuento={setDescuento}
            setFormaPago={setFormaPago}
            setProductoVentaSeleccionado={setProductoVentaSeleccionado}
            setTipoVenta={setTipoVenta}
            subtotalVenta={subtotalVenta}
            tipoVenta={tipoVenta}
            totalVenta={totalVenta}
            usuarioLogueado={usuarioLogueado}
            salirDeCaja={() => setSeccionActual('Inicio')}
          />
        </main>
      </div>
    )
  }

  // ===================================================
  // SISTEMA
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <Sidebar
        secciones={seccionesPermitidas}
        actual={seccionActual}
        cambiarSeccion={setSeccionActual}
        abierto={menuAbierto}
        cerrar={() => setMenuAbierto(false)}
      />

      <div className="flex-1 min-w-0">

        <Header
          seccion={seccionActual}
          usuario={usuarioLogueado}
          cerrarSesion={cerrarSesion}
          abrirMenu={() => setMenuAbierto(true)}
        />

        <main className="p-8">

          {/* ================================================= */}
          {/* INICIO */}
          {/* ================================================= */}

          {seccionActual === 'Inicio' && (
            <Inicio
              clientes={clientes}
              reporte={reporte}
              stockBajo={stockBajo}
              usuarioLogueado={usuarioLogueado}
            />
          )}

          {/* ================================================= */}
          {/* EMPLEADOS */}
          {/* ================================================= */}

          {seccionActual === 'Empleados' && (
            <Empleados
              busquedaEmpleado={busquedaEmpleado}
              cambiarEstadoEmpleado={cambiarEstadoEmpleado}
              editarEmpleado={editarEmpleado}
              empleadoEditando={empleadoEditando}
              empleadosFiltrados={empleadosFiltrados}
              formularioEmpleado={formularioEmpleado}
              guardarEmpleado={guardarEmpleado}
              mostrarFormularioEmpleado={mostrarFormularioEmpleado}
              nuevoEmpleado={nuevoEmpleado}
              roles={roles}
              setBusquedaEmpleado={setBusquedaEmpleado}
              setEmpleadoEditando={setEmpleadoEditando}
              setFormularioEmpleado={setFormularioEmpleado}
              setMostrarFormularioEmpleado={setMostrarFormularioEmpleado}
              usuarioLogueado={usuarioLogueado}
            />
          )}

          {/* ================================================= */}
          {/* VENTAS */}
          {/* ================================================= */}

          {seccionActual === 'Ventas' && (
            <Ventas
              ticketVenta={ticketVenta}
              setTicketVenta={setTicketVenta}
              agregarProductoManual={agregarProductoManual}
              buscarCodigo={buscarCodigo}
              cambiarCantidad={cambiarCantidad}
              cambiarClienteVenta={cambiarClienteVenta}
              carrito={carrito}
              clienteVenta={clienteVenta}
              clientes={clientes}
              codigoVenta={codigoVenta}
              confirmarVenta={confirmarVenta}
              descuento={descuento}
              descuentoNumero={descuentoNumero}
              descuentoImporte={descuentoImporte}
              formaPago={formaPago}
              guardandoVenta={guardandoVenta}
              obtenerPrecio={obtenerPrecio}
              productoVentaSeleccionado={productoVentaSeleccionado}
              productos={productos}
              setCodigoVenta={setCodigoVenta}
              setDescuento={setDescuento}
              setFormaPago={setFormaPago}
              setProductoVentaSeleccionado={setProductoVentaSeleccionado}
              setTipoVenta={setTipoVenta}
              subtotalVenta={subtotalVenta}
              tipoVenta={tipoVenta}
              totalVenta={totalVenta}
              usuarioLogueado={usuarioLogueado}
              salirDeCaja={() => setSeccionActual('Inicio')}
            />
          )}

          {/* ================================================= */}
          {/* PEDIDOS / REPARTOS */}
          {/* ================================================= */}

          {seccionActual === 'Pedidos' && (
            <Pedidos
              clientes={clientes}
              productos={productos}
              usuario={usuarioLogueado}
              cargarClientes={cargarClientes}
            />
          )}

          {/* ================================================= */}
          {/* CLIENTES */}
          {/* ================================================= */}

          {seccionActual === 'Clientes' && (
            <Clientes
              busquedaCliente={busquedaCliente}
              clientesFiltrados={clientesFiltrados}
              editarCliente={editarCliente}
              eliminarCliente={eliminarCliente}
              formularioCliente={formularioCliente}
              guardarCliente={guardarCliente}
              mostrarFormularioCliente={mostrarFormularioCliente}
              nuevoCliente={nuevoCliente}
              setBusquedaCliente={setBusquedaCliente}
              setFormularioCliente={setFormularioCliente}
              setMostrarFormularioCliente={setMostrarFormularioCliente}
              usuarioLogueado={usuarioLogueado}
            />
          )}

          {/* ================================================= */}
          {/* PRODUCTOS */}
          {/* ================================================= */}

          {seccionActual === 'Productos' && (
            <Productos
              rol={usuarioLogueado.rol}
              nuevoProducto={nuevoProducto}
              mostrarFormularioProducto={mostrarFormularioProducto}
              guardarProducto={guardarProducto}
              formularioProducto={formularioProducto}
              setFormularioProducto={setFormularioProducto}
              busquedaProducto={busquedaProducto}
              setBusquedaProducto={setBusquedaProducto}
              productosFiltrados={productosFiltrados}
              editarProducto={editarProducto}
              cargarProductos={cargarProductos}
            />
          )}

          {/* ================================================= */}
          {/* STOCK */}
          {/* ================================================= */}

          {seccionActual === 'Stock' && (
            <Stock
              rol={usuarioLogueado.rol}
              registrarMovimiento={registrarMovimiento}
              formularioMovimiento={formularioMovimiento}
              setFormularioMovimiento={setFormularioMovimiento}
              productos={productos}
              productoStockSeleccionado={productoStockSeleccionado}
              busquedaStock={busquedaStock}
              setBusquedaStock={setBusquedaStock}
              productosStock={productosStock}
              editandoStockMasivo={editandoStockMasivo}
              iniciarEdicionStockMasivo={iniciarEdicionStockMasivo}
              cancelarEdicionStockMasivo={cancelarEdicionStockMasivo}
              guardarStockMasivo={guardarStockMasivo}
              guardandoStockMasivo={guardandoStockMasivo}
              stockEditable={stockEditable}
              setStockEditable={setStockEditable}
              movimientos={movimientos}
            />
          )}

{/* ================================================= */}
{/* PROVEEDORES */}
{/* ================================================= */}

{seccionActual === 'Proveedores' && (
            <Proveedores
              busquedaProveedor={busquedaProveedor}
              editarProveedor={editarProveedor}
              eliminarProveedor={eliminarProveedor}
              formularioProveedor={formularioProveedor}
              guardarProveedor={guardarProveedor}
              mostrarFormularioProveedor={mostrarFormularioProveedor}
              nuevoProveedor={nuevoProveedor}
              proveedorEditando={proveedorEditando}
              proveedoresFiltrados={proveedoresFiltrados}
              setBusquedaProveedor={setBusquedaProveedor}
              setFormularioProveedor={setFormularioProveedor}
              setMostrarFormularioProveedor={setMostrarFormularioProveedor}
              setProveedorEditando={setProveedorEditando}
            />
          )}

{/* ================================================= */}
{/* COMPRAS */}
{/* ================================================= */}

{seccionActual === 'Compras' && (
            <Compras
              agregarProductoCompra={agregarProductoCompra}
              cambiarCantidadCompra={cambiarCantidadCompra}
              cambiarPrecioCompra={cambiarPrecioCompra}
              cantidadCompra={cantidadCompra}
              carritoCompra={carritoCompra}
              compras={compras}
              confirmarCompra={confirmarCompra}
              eliminarProductoCompra={eliminarProductoCompra}
              guardandoCompra={guardandoCompra}
              observacionCompra={observacionCompra}
              precioCompra={precioCompra}
              productoCompra={productoCompra}
              productos={productos}
              proveedorCompra={proveedorCompra}
              proveedores={proveedores}
              seleccionarProductoCompra={seleccionarProductoCompra}
              setCantidadCompra={setCantidadCompra}
              setObservacionCompra={setObservacionCompra}
              setPrecioCompra={setPrecioCompra}
              setProveedorCompra={setProveedorCompra}
              totalCompra={totalCompra}
            />
          )}
{/* ================================================= */}
{/* PRECIOS */}
{/* ================================================= */}

{seccionActual === 'Precios' && (
            <Precios
              busquedaPrecio={busquedaPrecio}
              calcularMargen={calcularMargen}
              cambiarPrecio={cambiarPrecio}
              guardarPreciosProducto={guardarPreciosProducto}
              obtenerPrecioCampo={obtenerPrecioCampo}
              preciosEditables={preciosEditables}
              productosPrecioFiltrados={productosPrecioFiltrados}
              setBusquedaPrecio={setBusquedaPrecio}
            />
          )}
          {/* ================================================= */}
          {/* REPORTES */}
          {/* ================================================= */}

{seccionActual === 'Reportes' && (
            <Reportes
              cargandoReporte={cargandoReporte}
              cargarReporte={cargarReporte}
              reporte={reporte}
              reporteDesde={reporteDesde}
              reporteHasta={reporteHasta}
              setReporteDesde={setReporteDesde}
              setReporteHasta={setReporteHasta}
            />
          )}

          {/* ================================================= */}
          {/* CONFIGURACION */}
          {/* ================================================= */}

          {seccionActual === 'Configuracion' && (
            <Configuracion
              configuracion={configuracion}
              guardandoConfiguracion={guardandoConfiguracion}
              guardarConfiguracion={guardarConfiguracion}
              setConfiguracion={setConfiguracion}
            />
          )}

        </main>

      </div>

    </div>
  )
}



export default App

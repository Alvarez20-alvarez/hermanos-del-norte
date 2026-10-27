import { useEffect, useMemo, useState } from 'react'
import { API } from '../../config/api'
import type {
  Cliente,
  EstadoPedido,
  FormaPagoPedido,
  Pedido,
  Producto,
  UsuarioSesion,
} from '../../tipos'

type ItemPedidoNuevo = {
  producto: Producto
  cantidad: number
}

type Props = {
  clientes: Cliente[]
  productos: Producto[]
  usuario: UsuarioSesion
  cargarClientes: () => Promise<void>
}

const estados: EstadoPedido[] = ['PENDIENTE', 'ENTREGADO']

const nombreEstado: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  ENTREGADO: 'Entregado',
}

export default function Pedidos({
  clientes,
  productos,
  usuario,
  cargarClientes,
}: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | EstadoPedido>('TODOS')

  const [clienteId, setClienteId] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [referencia, setReferencia] = useState('')
  const [observacion, setObservacion] = useState('')
  const [tipoClienteNuevo, setTipoClienteNuevo] =
    useState<'MINORISTA' | 'MAYORISTA'>('MINORISTA')
  const [dniCuitNuevo, setDniCuitNuevo] = useState('')
  const [guardandoCliente, setGuardandoCliente] = useState(false)

  const [productoId, setProductoId] = useState('')
  const [busquedaProductoPedido, setBusquedaProductoPedido] = useState('')
  const [cantidad, setCantidad] = useState('1')
  const [carrito, setCarrito] = useState<ItemPedidoNuevo[]>([])

  const [montoPago, setMontoPago] = useState<Record<number, string>>({})
  const [formaPagoPedido, setFormaPagoPedido] = useState<Record<number, FormaPagoPedido>>({})
  const [notaPago, setNotaPago] = useState<Record<number, string>>({})
  const [guardandoPago, setGuardandoPago] = useState<number | null>(null)
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<number[]>([])
  const [paginaPedidos, setPaginaPedidos] = useState(1)
  const [pedidosPorPagina, setPedidosPorPagina] = useState(10)

  const clienteSeleccionado = useMemo(
    () => clientes.find((cliente) => cliente.id === Number(clienteId)),
    [clientes, clienteId]
  )

  const esMayorista =
    clienteSeleccionado?.tipo_cliente === 'MAYORISTA' ||
    (!clienteSeleccionado && tipoClienteNuevo === 'MAYORISTA')

  const obtenerPrecio = (producto: Producto) =>
    esMayorista
      ? Number(producto.precio_mayorista)
      : Number(producto.precio_minorista)

  const totalPedido = carrito.reduce(
    (total, item) => total + obtenerPrecio(item.producto) * item.cantidad,
    0
  )

  const productosFiltradosPedido = useMemo(() => {
    const texto = busquedaProductoPedido.trim().toLowerCase()

    if (!texto) return productos

    return productos.filter((producto) => {
      const nombre = producto.nombre.toLowerCase()
      const categoria = (producto.categoria || '').toLowerCase()
      const presentacion = (producto.presentacion || '').toLowerCase()
      const codigo = (producto.codigo_barras || '').toLowerCase()

      return (
        nombre.includes(texto) ||
        categoria.includes(texto) ||
        presentacion.includes(texto) ||
        codigo.includes(texto)
      )
    })
  }, [productos, busquedaProductoPedido])

  const cargarPedidos = async () => {
    try {
      setCargando(true)
      const respuesta = await fetch(`${API}/pedidos`)
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje || 'No se pudieron cargar los pedidos')
        return
      }

      setPedidos(datos)
    } catch {
      alert('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
  }, [])

  const seleccionarCliente = (id: string) => {
    setClienteId(id)

    if (!id) {
      setClienteNombre('')
      setTelefono('')
      setDireccion('')
      setDniCuitNuevo('')
      setTipoClienteNuevo('MINORISTA')
      return
    }

    const cliente = clientes.find((item) => item.id === Number(id))

    if (cliente) {
      setClienteNombre(cliente.nombre)
      setTelefono(cliente.telefono || '')
      setDireccion(cliente.direccion || '')
      setDniCuitNuevo(cliente.dni_cuit || '')
      setTipoClienteNuevo(cliente.tipo_cliente)
    }
  }

  const guardarClienteHabitual = async () => {
    if (!clienteNombre.trim()) {
      alert('Ingresá el nombre del cliente')
      return
    }

    try {
      setGuardandoCliente(true)

      const respuesta = await fetch(`${API}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: clienteNombre.trim(),
          dni_cuit: dniCuitNuevo.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          tipo_cliente: tipoClienteNuevo,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje || 'No se pudo guardar el cliente')
        return
      }

      await cargarClientes()
      setClienteId(String(datos.cliente_id))

      alert('Cliente guardado como habitual')
    } catch {
      alert('No se pudo conectar con el servidor')
    } finally {
      setGuardandoCliente(false)
    }
  }

  const agregarProducto = () => {
    const producto = productos.find((item) => item.id === Number(productoId))
    const cantidadNumero = Number(cantidad)

    if (!producto) {
      alert('Seleccioná un producto')
      return
    }

    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      alert('Ingresá una cantidad válida')
      return
    }

    const existente = carrito.find((item) => item.producto.id === producto.id)
    const nuevaCantidad = (existente?.cantidad || 0) + cantidadNumero

    if (nuevaCantidad > Number(producto.stock)) {
      alert(`Stock disponible: ${producto.stock}`)
      return
    }

    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      )
    } else {
      setCarrito([...carrito, { producto, cantidad: cantidadNumero }])
    }

    setProductoId('')
    setBusquedaProductoPedido('')
    setCantidad('1')
  }

  const cambiarCantidad = (producto: Producto, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter((item) => item.producto.id !== producto.id))
      return
    }

    if (nuevaCantidad > Number(producto.stock)) {
      alert(`Stock disponible: ${producto.stock}`)
      return
    }

    setCarrito(
      carrito.map((item) =>
        item.producto.id === producto.id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    )
  }

  const limpiarFormulario = () => {
    setClienteId('')
    setClienteNombre('')
    setTelefono('')
    setDireccion('')
    setReferencia('')
    setObservacion('')
    setTipoClienteNuevo('MINORISTA')
    setDniCuitNuevo('')
    setProductoId('')
    setBusquedaProductoPedido('')
    setCantidad('1')
    setCarrito([])
  }

  const guardarPedido = async () => {
    if (!clienteNombre.trim()) {
      alert('Ingresá o seleccioná el nombre del cliente')
      return
    }

    if (carrito.length === 0) {
      alert('Agregá al menos un producto al pedido')
      return
    }

    try {
      setGuardando(true)

      const respuesta = await fetch(`${API}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId ? Number(clienteId) : null,
          cliente_nombre: clienteNombre.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          referencia: referencia.trim(),
          observacion: observacion.trim(),
          usuario: usuario.usuario,
          productos: carrito.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje || 'No se pudo guardar el pedido')
        return
      }

      alert(`Pedido #${datos.pedido_id} guardado correctamente`)
      limpiarFormulario()
      await cargarPedidos()
    } catch {
      alert('No se pudo conectar con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  const actualizarEstado = async (pedido: Pedido, estado: EstadoPedido) => {
    try {
      const respuesta = await fetch(`${API}/pedidos/${pedido.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje || 'No se pudo cambiar el estado')
        return
      }

      await cargarPedidos()
    } catch {
      alert('No se pudo conectar con el servidor')
    }
  }

  const registrarPago = async (pedido: Pedido) => {
    const monto = Number(montoPago[pedido.id] || 0)
    const saldo = Number(pedido.saldo || 0)
    const forma = formaPagoPedido[pedido.id] || 'EFECTIVO'

    if (!monto || monto <= 0) {
      alert('Ingresá un monto válido')
      return
    }

    if (monto > saldo) {
      alert(`El saldo pendiente es $${saldo.toLocaleString('es-AR')}`)
      return
    }

    try {
      setGuardandoPago(pedido.id)

      const respuesta = await fetch(`${API}/pedidos/${pedido.id}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto,
          forma_pago: forma,
          nota: notaPago[pedido.id] || '',
          usuario: usuario.usuario,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        alert(datos.mensaje || 'No se pudo registrar el pago')
        return
      }

      setMontoPago((anterior) => ({ ...anterior, [pedido.id]: '' }))
      setNotaPago((anterior) => ({ ...anterior, [pedido.id]: '' }))
      await cargarPedidos()
    } catch {
      alert('No se pudo conectar con el servidor')
    } finally {
      setGuardandoPago(null)
    }
  }

  const escaparHtml = (valor: unknown) =>
    String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const construirBoletaPedido = (pedido: Pedido) => {
    const filas = pedido.detalles
      .map(
        (item) => `
          <tr>
            <td class="cantidad">${item.cantidad}</td>
            <td class="producto">
              <strong>${escaparHtml(item.producto)}</strong>
              ${
                item.presentacion
                  ? `<span>${escaparHtml(item.presentacion)}</span>`
                  : ''
              }
            </td>
            <td class="numero">$${Number(item.precio_unitario).toLocaleString('es-AR')}</td>
            <td class="numero subtotal">$${Number(item.subtotal).toLocaleString('es-AR')}</td>
          </tr>
        `
      )
      .join('')

    return `
      <section class="boleta">
        <div class="encabezado">
          <img class="logo" src="${window.location.origin}/hn-logo.png" />
          <div class="marca">
            <div class="nombre">
              HERMANOS <span>DEL NORTE</span>
            </div>
            <div class="submarca">
              DISTRIBUIDORA MAYORISTA Y MINORISTA
            </div>
            <div class="tipo">
              PEDIDO PARA PREPARACIÓN Y REPARTO
            </div>
          </div>

          <div class="numero-pedido">
            <div class="pedido-titulo">
              PEDIDO <span>#${pedido.id}</span>
            </div>
            <div class="fecha-titulo">FECHA:</div>
            <div class="fecha">
              ${new Date(pedido.fecha).toLocaleString('es-AR')}
            </div>
          </div>
        </div>

        <div class="datos">
          <div class="dato">
            <span class="etiqueta">CLIENTE:</span>
            <strong>${escaparHtml(pedido.cliente_nombre)}</strong>
          </div>
          <div class="dato">
            <span class="etiqueta">DIRECCIÓN:</span>
            <strong>${escaparHtml(pedido.direccion || '-')}</strong>
          </div>
          <div class="dato">
            <span class="etiqueta">TELÉFONO:</span>
            <strong>${escaparHtml(pedido.telefono || '-')}</strong>
          </div>
          <div class="dato">
            <span class="etiqueta">ESTADO:</span>
            <strong>${nombreEstado[pedido.estado]}</strong>
          </div>
          ${
            pedido.referencia
              ? `
                <div class="dato dato-completo">
                  <span class="etiqueta">REFERENCIA:</span>
                  <strong>${escaparHtml(pedido.referencia)}</strong>
                </div>
              `
              : ''
          }
        </div>

        <div class="contenido">
          <img class="marca-agua" src="${window.location.origin}/hn-logo.png" />

          <table>
            <thead>
              <tr>
                <th class="cantidad">CANT.</th>
                <th>PRODUCTO / PRESENTACIÓN</th>
                <th class="numero">P. UNITARIO</th>
                <th class="numero">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>

          ${
            pedido.observacion
              ? `
                <div class="observacion">
                  <strong>OBSERVACIÓN:</strong>
                  ${escaparHtml(pedido.observacion)}
                </div>
              `
              : ''
          }

          <div class="pie">
            <div class="alias">
              <strong>Alias: santiago100lemon</strong>
              <span>Para transferencias o pagos por medios digitales.</span>
            </div>

            <div class="totales">
              <div>
                <span>TOTAL:</span>
                <strong>$${Number(pedido.total).toLocaleString('es-AR')}</strong>
              </div>
              <div>
                <span>PAGADO:</span>
                <strong>$${Number(pedido.pagado).toLocaleString('es-AR')}</strong>
              </div>
              <div>
                <span>DEBE:</span>
                <strong>$${Number(pedido.saldo).toLocaleString('es-AR')}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    `
  }

  const abrirImpresion = (pedidosAImprimir: Pedido[]) => {
    if (pedidosAImprimir.length === 0) {
      alert('Seleccioná al menos un pedido para imprimir')
      return
    }

    const ventana = window.open('', '_blank')
    if (!ventana) {
      alert('El navegador bloqueó la ventana de impresión')
      return
    }

    const boletas = pedidosAImprimir
      .map((pedido) => construirBoletaPedido(pedido))
      .join('')

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Pedidos - Hermanos del Norte</title>

          <style>
            * {
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 7mm;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              color: #111;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .hoja {
              width: 100%;
            }

            .boleta {
              width: 100%;
              border: 1px solid #aeb6c2;
              border-radius: 5px;
              overflow: hidden;
              margin: 0 0 5mm 0;
              break-inside: avoid;
              page-break-inside: avoid;
              background: #fff;
            }

            .encabezado {
              min-height: 34mm;
              background: #07192d;
              color: #fff;
              display: grid;
              grid-template-columns: 27mm 1fr 42mm;
              align-items: center;
              gap: 4mm;
              padding: 3mm 4mm;
            }

            .logo {
              width: 25mm;
              height: 25mm;
              object-fit: contain;
            }

            .marca {
              min-width: 0;
              text-align: center;
            }

            .nombre {
              font-size: 20pt;
              line-height: 1;
              font-weight: 900;
              letter-spacing: -0.8px;
              white-space: nowrap;
            }

            .nombre span {
              color: #e5a927;
            }

            .submarca {
              font-size: 8pt;
              letter-spacing: 2.2px;
              margin-top: 2mm;
              font-weight: 700;
            }

            .tipo {
              margin-top: 2.5mm;
              background: #fff;
              color: #07192d;
              border-radius: 2px;
              padding: 1.3mm 2mm;
              font-size: 8.5pt;
              font-weight: 900;
              letter-spacing: .5px;
            }

            .numero-pedido {
              background: #fff;
              color: #111;
              border-radius: 4px;
              padding: 2.5mm 3mm;
              align-self: stretch;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }

            .pedido-titulo {
              font-size: 14pt;
              font-weight: 900;
              padding-bottom: 1.5mm;
              border-bottom: 1.5px solid #e5a927;
            }

            .pedido-titulo span {
              color: #c98813;
            }

            .fecha-titulo {
              font-size: 7.5pt;
              font-weight: 900;
              margin-top: 2mm;
            }

            .fecha {
              font-size: 7.5pt;
              margin-top: .5mm;
            }

            .datos {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1.5mm 8mm;
              padding: 3mm 5mm;
              border-bottom: 1px solid #b9c0ca;
              font-size: 9pt;
            }

            .dato {
              display: grid;
              grid-template-columns: 25mm 1fr;
              align-items: center;
              min-height: 5mm;
            }

            .dato-completo {
              grid-column: 1 / -1;
            }

            .etiqueta {
              font-size: 7.5pt;
              font-weight: 700;
            }

            .contenido {
              position: relative;
              padding: 3mm 4mm 4mm;
              overflow: hidden;
            }

            .marca-agua {
              position: absolute;
              width: 48mm;
              height: 48mm;
              object-fit: contain;
              opacity: .055;
              left: 50%;
              top: 52%;
              transform: translate(-50%, -50%);
              z-index: 0;
              filter: grayscale(100%);
            }

            table,
            .pie,
            .observacion {
              position: relative;
              z-index: 1;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8.5pt;
            }

            th {
              background: #eef1f4;
              border: 1px solid #c5cbd3;
              padding: 1.8mm 2mm;
              font-size: 7.5pt;
              text-align: left;
              color: #111;
            }

            td {
              border: 1px solid #d5d9df;
              padding: 1.8mm 2mm;
              vertical-align: top;
            }

            td.producto strong {
              display: block;
              font-size: 8.5pt;
            }

            td.producto span {
              display: block;
              color: #555;
              font-size: 7.3pt;
              margin-top: .5mm;
            }

            .cantidad {
              width: 15mm;
              text-align: center;
              font-weight: 700;
            }

            .numero {
              width: 30mm;
              text-align: right;
              white-space: nowrap;
            }

            td.subtotal {
              font-weight: 800;
            }

            .observacion {
              border: 1px solid #cfd4db;
              padding: 2mm 3mm;
              margin-top: 2mm;
              font-size: 7.5pt;
            }

            .pie {
              display: grid;
              grid-template-columns: 1fr 50mm;
              gap: 5mm;
              align-items: end;
              margin-top: 3mm;
            }

            .alias {
              max-width: 65mm;
              border: 1px solid #d5d9df;
              background: #f4f5f6;
              padding: 3mm;
              border-radius: 3px;
            }

            .alias strong {
              display: block;
              font-size: 9pt;
            }

            .alias span {
              display: block;
              margin-top: 1mm;
              font-size: 7.2pt;
              color: #444;
            }

            .totales {
              border: 1px solid #9ea7b2;
              border-radius: 3px;
              padding: 1mm 3mm;
              background: #fff;
            }

            .totales div {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 4mm;
              border-bottom: 1px solid #ccd1d7;
              padding: 1.8mm 0;
              font-size: 9pt;
              font-weight: 800;
            }

            .totales div:last-child {
              border-bottom: 0;
            }

            .totales strong {
              font-size: 11pt;
              color: #111;
            }

            @media print {
              body {
                width: 100%;
              }

              .boleta:last-child {
                margin-bottom: 0;
              }
            }
          </style>
        </head>

        <body>
          <main class="hoja">
            ${boletas}
          </main>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print()
              }, 350)
            }
          </script>
        </body>
      </html>
    `)

    ventana.document.close()
  }

  const imprimirPedido = (pedido: Pedido) => {
    abrirImpresion([pedido])
  }

  const cambiarSeleccionPedido = (pedidoId: number) => {
    setPedidosSeleccionados((actuales) =>
      actuales.includes(pedidoId)
        ? actuales.filter((id) => id !== pedidoId)
        : [...actuales, pedidoId]
    )
  }

  const imprimirPedidosSeleccionados = () => {
    const seleccionados = pedidos.filter((pedido) =>
      pedidosSeleccionados.includes(pedido.id)
    )

    abrirImpresion(seleccionados)
  }

  const pedidosFiltrados =
    filtroEstado === 'TODOS'
      ? pedidos
      : pedidos.filter((pedido) => pedido.estado === filtroEstado)

  const totalPaginasPedidos = Math.max(1, Math.ceil(pedidosFiltrados.length / pedidosPorPagina))
  const inicioPedidos = (paginaPedidos - 1) * pedidosPorPagina
  const pedidosPagina = pedidosFiltrados.slice(inicioPedidos, inicioPedidos + pedidosPorPagina)

  useEffect(() => setPaginaPedidos(1), [filtroEstado, pedidosPorPagina])
  useEffect(() => {
    if (paginaPedidos > totalPaginasPedidos) setPaginaPedidos(totalPaginasPedidos)
  }, [paginaPedidos, totalPaginasPedidos])

  const totalAdeudado = pedidos.reduce(
    (total, pedido) => total + Number(pedido.saldo || 0),
    0
  )

  const deudasPorCliente = useMemo(() => {
    const mapa = new Map<string, number>()

    pedidos.forEach((pedido) => {
      const saldo = Number(pedido.saldo || 0)
      if (saldo <= 0) return

      const actual = mapa.get(pedido.cliente_nombre) || 0
      mapa.set(pedido.cliente_nombre, actual + saldo)
    })

    return Array.from(mapa.entries())
      .map(([nombre, deuda]) => ({ nombre, deuda }))
      .sort((a, b) => b.deuda - a.deuda)
  }, [pedidos])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Pedidos / Repartos</h3>
        <p className="text-slate-500">
          Cargá pedidos, imprimí la boleta y llevá la cuenta de lo pagado y lo que falta cobrar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <div className="text-sm text-slate-500">Pedidos pendientes</div>
          <div className="text-3xl font-bold mt-1">
            {pedidos.filter((pedido) => pedido.estado === 'PENDIENTE').length}
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <div className="text-sm text-slate-500">Total que te deben</div>
          <div className="text-3xl font-bold mt-1 text-red-600">
            ${totalAdeudado.toLocaleString('es-AR')}
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <div className="text-sm text-slate-500">Clientes con deuda</div>
          <div className="text-3xl font-bold mt-1">{deudasPorCliente.length}</div>
        </div>
      </div>

      {deudasPorCliente.length > 0 && (
        <div className="bg-white border rounded-2xl p-6">
          <h4 className="text-xl font-bold mb-4">Cuenta de clientes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {deudasPorCliente.map((cliente) => (
              <div key={cliente.nombre} className="border rounded-xl p-4 flex justify-between gap-3">
                <strong>{cliente.nombre}</strong>
                <span className="font-bold text-red-600">
                  Debe ${cliente.deuda.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border rounded-2xl p-6 space-y-5">
          <div>
            <h4 className="text-xl font-bold">Nuevo pedido</h4>
            <p className="text-sm text-slate-500">
              Si el cliente ya está guardado, seleccionarlo completa sus datos automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="font-semibold">Cliente habitual</label>
                {!clienteId && (
                  <span className="text-xs text-slate-500">
                    Podés guardar el cliente nuevo abajo
                  </span>
                )}
              </div>

              <select
                value={clienteId}
                onChange={(e) => seleccionarCliente(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl"
              >
                <option value="">+ Cliente nuevo / escribir manualmente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.tipo_cliente}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-2">Nombre del cliente *</label>
              <input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl"
                placeholder="Nombre o negocio"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Teléfono</label>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl"
                placeholder="Teléfono del cliente"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Dirección</label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl"
                placeholder="Dirección de entrega"
              />
            </div>

            {!clienteId && (
              <>
                <div>
                  <label className="font-semibold block mb-2">DNI / CUIT</label>
                  <input
                    value={dniCuitNuevo}
                    onChange={(e) => setDniCuitNuevo(e.target.value)}
                    className="w-full border px-4 py-3 rounded-xl"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-2">Tipo de cliente</label>
                  <div className="flex gap-2">
                    <select
                      value={tipoClienteNuevo}
                      onChange={(e) =>
                        setTipoClienteNuevo(
                          e.target.value as 'MINORISTA' | 'MAYORISTA'
                        )
                      }
                      className="flex-1 border px-4 py-3 rounded-xl"
                    >
                      <option value="MINORISTA">Minorista</option>
                      <option value="MAYORISTA">Mayorista</option>
                    </select>

                    <button
                      type="button"
                      onClick={guardarClienteHabitual}
                      disabled={guardandoCliente || !clienteNombre.trim()}
                      className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-40"
                    >
                      {guardandoCliente ? 'Guardando...' : 'Guardar cliente'}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="font-semibold block mb-2">Referencia</label>
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl"
                placeholder="Ej: frente a la plaza"
              />
            </div>

            <div>
              <label className="font-semibold block mb-2">Observación</label>
              <input
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl"
                placeholder="Horario, forma de entrega, etc."
              />
            </div>
          </div>

          <div className="border-t pt-5">
            <h5 className="font-bold mb-3">Productos</h5>
            <div className="space-y-3">
              <div className="relative">
                <input
                  value={busquedaProductoPedido}
                  onChange={(e) => {
                    setBusquedaProductoPedido(e.target.value)
                    setProductoId('')
                  }}
                  className="w-full border px-4 py-3 rounded-xl"
                  placeholder="Escribí para buscar... Ej: pep, coca, secco"
                  autoComplete="off"
                />

                {busquedaProductoPedido.trim() !== '' &&
                  !productoId &&
                  productosFiltradosPedido.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl max-h-72 overflow-y-auto">
                      {productosFiltradosPedido.slice(0, 10).map((producto) => {
                        const sinStock = Number(producto.stock) <= 0

                        return (
                          <button
                            key={producto.id}
                            type="button"
                            disabled={sinStock}
                            onClick={() => {
                              setProductoId(String(producto.id))
                              setBusquedaProductoPedido(producto.nombre)
                            }}
                            className={`w-full px-4 py-3 text-left border-b last:border-b-0 ${
                              sinStock
                                ? 'opacity-50 cursor-not-allowed bg-slate-50'
                                : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-semibold">
                              {producto.nombre}
                            </div>
                            <div className="text-sm text-slate-500">
                              {producto.presentacion || 'Sin presentación'} · Stock {producto.stock}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                {busquedaProductoPedido.trim() !== '' &&
                  !productoId &&
                  productosFiltradosPedido.length === 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg px-4 py-3 text-sm text-red-600">
                      No se encontraron productos con “{busquedaProductoPedido}”.
                    </div>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3">
                <div className="border px-4 py-3 rounded-xl bg-slate-50 min-h-[50px]">
                  {productoId ? (
                    <span className="font-semibold">
                      {productos.find((producto) => producto.id === Number(productoId))?.nombre}
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Seleccioná un producto de la lista
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="border px-4 py-3 rounded-xl"
                />

                <button
                  type="button"
                  onClick={agregarProducto}
                  className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Producto</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => {
                  const precio = obtenerPrecio(item.producto)
                  return (
                    <tr key={item.producto.id} className="border-t">
                      <td className="p-3 font-semibold">{item.producto.nombre}</td>
                      <td className="p-3 text-center">${precio.toLocaleString('es-AR')}</td>
                      <td className="p-3">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.producto, item.cantidad - 1)}
                            className="border w-8 h-8 rounded-lg"
                          >
                            -
                          </button>
                          <strong>{item.cantidad}</strong>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.producto, item.cantidad + 1)}
                            className="border w-8 h-8 rounded-lg"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold">
                        ${(precio * item.cantidad).toLocaleString('es-AR')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.producto, 0)}
                          className="text-red-600"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {carrito.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Todavía no agregaste productos.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 h-fit">
          <h4 className="text-xl font-bold">Resumen del pedido</h4>
          <div className="space-y-3 mt-5">
            <div className="flex justify-between">
              <span>Cliente</span>
              <strong className="text-right">{clienteNombre || 'Sin seleccionar'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Precio</span>
              <strong>{esMayorista ? 'Mayorista' : 'Minorista'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Bultos / ítems</span>
              <strong>{carrito.reduce((n, item) => n + item.cantidad, 0)}</strong>
            </div>
            <div className="flex justify-between text-2xl font-bold border-t pt-4">
              <span>Total</span>
              <span>${totalPedido.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={guardarPedido}
            disabled={guardando || carrito.length === 0}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-6 disabled:opacity-40"
          >
            {guardando ? 'Guardando...' : 'Guardar pedido'}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h4 className="text-xl font-bold">Pedidos cargados</h4>
            <p className="text-sm text-slate-500">Pendientes, entregados y cuenta corriente.</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const idsVisibles = pedidosPagina.map((pedido) => pedido.id)
                const todosSeleccionados =
                  idsVisibles.length > 0 &&
                  idsVisibles.every((id) => pedidosSeleccionados.includes(id))

                setPedidosSeleccionados((actuales) =>
                  todosSeleccionados
                    ? actuales.filter((id) => !idsVisibles.includes(id))
                    : Array.from(new Set([...actuales, ...idsVisibles]))
                )
              }}
              className="border px-4 py-2 rounded-xl font-semibold"
            >
              Seleccionar visibles
            </button>

            <button
              type="button"
              onClick={imprimirPedidosSeleccionados}
              disabled={pedidosSeleccionados.length === 0}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-40"
            >
              Imprimir seleccionados ({pedidosSeleccionados.length})
            </button>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as 'TODOS' | EstadoPedido)}
              className="border px-3 py-2 rounded-xl"
            >
              <option value="TODOS">Todos</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>{nombreEstado[estado]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={cargarPedidos}
              className="border px-4 py-2 rounded-xl"
            >
              Actualizar
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="py-10 text-center text-slate-500">Cargando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No hay pedidos para mostrar.</div>
        ) : (
          <div className="space-y-4">
            {pedidosPagina.map((pedido) => (
              <div
                key={pedido.id}
                className={`border rounded-2xl p-5 ${
                  pedidosSeleccionados.includes(pedido.id)
                    ? 'ring-2 ring-slate-900'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={pedidosSeleccionados.includes(pedido.id)}
                    onChange={() => cambiarSeleccionPedido(pedido.id)}
                    className="mt-1 w-5 h-5"
                    title="Seleccionar para imprimir"
                  />

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h5 className="text-lg font-bold">Pedido #{pedido.id} · {pedido.cliente_nombre}</h5>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100">
                        {nombreEstado[pedido.estado]}
                      </span>
                      {Number(pedido.saldo) <= 0 ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          Pagado
                        </span>
                      ) : Number(pedido.pagado) > 0 ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                          Pago parcial
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
                          Falta pagar
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(pedido.fecha).toLocaleString('es-AR')}
                      {pedido.direccion ? ` · ${pedido.direccion}` : ''}
                    </p>
                    {pedido.referencia && (
                      <p className="text-sm mt-1"><strong>Referencia:</strong> {pedido.referencia}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold">${Number(pedido.total).toLocaleString('es-AR')}</div>
                    <div className="text-sm text-emerald-700 font-semibold">
                      Pagado: ${Number(pedido.pagado).toLocaleString('es-AR')}
                    </div>
                    <div className={`text-lg font-bold ${Number(pedido.saldo) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      Debe: ${Number(pedido.saldo).toLocaleString('es-AR')}
                    </div>
                    <button
                      type="button"
                      onClick={() => imprimirPedido(pedido)}
                      className="mt-2 border px-4 py-2 rounded-xl font-semibold"
                    >
                      Imprimir boleta
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 text-sm">
                  {pedido.detalles.map((item) => (
                    <div key={item.id} className="bg-slate-50 rounded-xl px-3 py-2">
                      <strong>{item.cantidad} × {item.producto}</strong>
                      {item.presentacion ? ` · ${item.presentacion}` : ''}
                    </div>
                  ))}
                </div>

                {pedido.observacion && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
                    <strong>Observación:</strong> {pedido.observacion}
                  </div>
                )}

                {pedido.pagos.length > 0 && (
                  <div className="mt-4 border rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 font-semibold">Pagos registrados</div>
                    <div className="divide-y">
                      {pedido.pagos.map((pago) => (
                        <div key={pago.id} className="px-4 py-3 text-sm flex flex-col md:flex-row md:justify-between gap-1">
                          <span>
                            {new Date(pago.fecha).toLocaleString('es-AR')} · {pago.forma_pago}
                            {pago.nota ? ` · ${pago.nota}` : ''}
                          </span>
                          <strong>${Number(pago.monto).toLocaleString('es-AR')}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Number(pedido.saldo) > 0 && (
                  <div className="mt-4 bg-slate-50 border rounded-xl p-4">
                    <div className="font-bold mb-3">Registrar pago</div>
                    <div className="grid grid-cols-1 md:grid-cols-[160px_180px_1fr_auto] gap-2">
                      <input
                        type="number"
                        min="1"
                        max={Number(pedido.saldo)}
                        value={montoPago[pedido.id] || ''}
                        onChange={(e) => setMontoPago((anterior) => ({ ...anterior, [pedido.id]: e.target.value }))}
                        className="border px-3 py-2 rounded-xl"
                        placeholder="Monto"
                      />
                      <select
                        value={formaPagoPedido[pedido.id] || 'EFECTIVO'}
                        onChange={(e) => setFormaPagoPedido((anterior) => ({ ...anterior, [pedido.id]: e.target.value as FormaPagoPedido }))}
                        className="border px-3 py-2 rounded-xl"
                      >
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      <input
                        value={notaPago[pedido.id] || ''}
                        onChange={(e) => setNotaPago((anterior) => ({ ...anterior, [pedido.id]: e.target.value }))}
                        className="border px-3 py-2 rounded-xl"
                        placeholder="Nota opcional"
                      />
                      <button
                        type="button"
                        onClick={() => registrarPago(pedido)}
                        disabled={guardandoPago === pedido.id}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-40"
                      >
                        {guardandoPago === pedido.id ? 'Guardando...' : 'Registrar pago'}
                      </button>
                    </div>
                  </div>
                )}

                    <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                      {pedido.estado === 'PENDIENTE' ? (
                        <button
                          type="button"
                          onClick={() => actualizarEstado(pedido, 'ENTREGADO')}
                          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold"
                        >
                          Marcar entregado
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => actualizarEstado(pedido, 'PENDIENTE')}
                          className="border px-4 py-2 rounded-xl font-semibold"
                        >
                          Volver a pendiente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && pedidosFiltrados.length > 0 && (
          <div className="mt-5 bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-slate-500">Mostrando {inicioPedidos + 1}–{Math.min(inicioPedidos + pedidosPorPagina, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos</span>
            <div className="flex flex-wrap items-center gap-2">
              <select value={pedidosPorPagina} onChange={(e) => setPedidosPorPagina(Number(e.target.value))} className="border px-3 py-2 rounded-lg"><option value={10}>10 por página</option><option value={20}>20 por página</option><option value={50}>50 por página</option></select>
              <button type="button" disabled={paginaPedidos <= 1} onClick={() => setPaginaPedidos((v) => Math.max(1, v - 1))} className="border px-3 py-2 rounded-lg disabled:opacity-40">Anterior</button>
              <span className="font-semibold">{paginaPedidos} / {totalPaginasPedidos}</span>
              <button type="button" disabled={paginaPedidos >= totalPaginasPedidos} onClick={() => setPaginaPedidos((v) => Math.min(totalPaginasPedidos, v + 1))} className="border px-3 py-2 rounded-lg disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

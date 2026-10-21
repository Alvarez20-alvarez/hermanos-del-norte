import type { TipoVenta } from '../../tipos'
import type { FormaPago } from '../../tipos'

type Props = {
  ticketVenta: any
  setTicketVenta: any
  agregarProductoManual: any
  buscarCodigo: any
  cambiarCantidad: any
  cambiarClienteVenta: any
  carrito: any
  clienteVenta: any
  clientes: any
  codigoVenta: any
  confirmarVenta: any
  descuento: any
  descuentoNumero: any
  descuentoImporte: any
  formaPago: any
  guardandoVenta: any
  obtenerPrecio: any
  productoVentaSeleccionado: any
  productos: any
  setCodigoVenta: any
  setDescuento: any
  setFormaPago: any
  setProductoVentaSeleccionado: any
  setTipoVenta: any
  subtotalVenta: any
  tipoVenta: any
  totalVenta: any
}

export default function Ventas(p: Props) {
  const imprimirTicket = () => {
    const contenido = document.getElementById('ticket-venta')

    if (!contenido) return

    const ventana = window.open('', '_blank', 'width=450,height=700')

    if (!ventana) return

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Ticket Hermanos del Norte</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              width: 320px;
              margin: 20px auto;
              color: #000;
            }
            h1, h2, p { margin: 5px 0; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              padding: 6px 2px;
              font-size: 13px;
            }
            th { border-bottom: 1px solid #000; }
            .derecha { text-align: right; }
            .centro { text-align: center; }
            .linea {
              border-top: 1px dashed #000;
              margin: 12px 0;
            }
            button { display: none; }
          </style>
        </head>
        <body>
          ${contenido.innerHTML}
        </body>
      </html>
    `)

    ventana.document.close()
    ventana.focus()

    setTimeout(() => {
      ventana.print()
    }, 300)
  }

  return (

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
                        p.buscarCodigo
                      }
                      className="flex gap-3 mt-4"
                    >

                      <input
                        autoFocus
                        value={
                          p.codigoVenta
                        }
                        onChange={(e) =>
                          p.setCodigoVenta(
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
                          p.productoVentaSeleccionado
                        }
                        onChange={(e) =>
                          p.setProductoVentaSeleccionado(
                            e.target.value
                          )
                        }
                        className="flex-1 border px-4 py-3 rounded-xl"
                      >

                        <option value="">
                          Agregar producto manualmente
                        </option>

                        {p.productos.map(
                          (producto: any) => (

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
                          p.agregarProductoManual
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

                        {p.carrito.map(
                          (item: any) => {

                            const precio =
                              p.obtenerPrecio(
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
                                        p.cambiarCantidad(
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
                                        p.cambiarCantidad(
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
                                      p.cambiarCantidad(
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

                    {p.carrito.length ===
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
                      p.clienteVenta
                    }
                    onChange={(e) =>
                      p.cambiarClienteVenta(
                        e.target.value
                      )
                    }
                    className="w-full border px-4 py-3 rounded-xl"
                  >

                    <option value="">
                      Consumidor final
                    </option>

                    {p.clientes.map(
                      (cliente: any) => (

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
                    value={p.tipoVenta}
                    onChange={(e) =>
                      p.setTipoVenta(
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
                    value={p.formaPago}
                    onChange={(e) =>
                      p.setFormaPago(
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
                    Descuento (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={p.descuento}
                    onChange={(e) =>
                      p.setDescuento(
                        e.target.value
                      )
                    }
                    className="w-full border px-4 py-3 rounded-xl"
                  />

                  <div className="border-t mt-6 pt-5 space-y-3">

                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <strong>
                        ${p.subtotalVenta.toLocaleString('es-AR')}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Descuento ({p.descuentoNumero}%)</span>
                      <span>
                        -${p.descuentoImporte.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex justify-between text-2xl font-bold border-t pt-4">
                      <span>TOTAL</span>
                      <span>
                        ${p.totalVenta.toLocaleString('es-AR')}
                      </span>
                    </div>

                  </div>

                  <button
                    onClick={
                      p.confirmarVenta
                    }
                    disabled={
                      p.guardandoVenta ||
                      p.carrito.length === 0
                    }
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-6 disabled:opacity-40"
                  >
                    {p.guardandoVenta
                      ? 'Registrando...'
                      : 'Confirmar venta'}
                  </button>

                </div>

              </div>

              {p.ticketVenta && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
                    <div id="ticket-venta" className="p-7">
                      <div className="text-center">
                        <h2 className="text-2xl font-black">HERMANOS DEL NORTE</h2>
                        <p className="text-sm">Distribuidora mayorista y minorista</p>
                      </div>

                      <div className="border-t border-dashed my-4" />

                      <div className="text-sm space-y-1">
                        <p><strong>Venta:</strong> #{p.ticketVenta.venta_id}</p>
                        <p><strong>Fecha:</strong> {p.ticketVenta.fecha}</p>
                        <p><strong>Cliente:</strong> {p.ticketVenta.cliente}</p>
                        <p><strong>Empleado:</strong> {p.ticketVenta.usuario}</p>
                        <p><strong>Tipo:</strong> {p.ticketVenta.tipoVenta}</p>
                        <p><strong>Pago:</strong> {p.ticketVenta.formaPago}</p>
                      </div>

                      <table className="w-full mt-4 text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Cant.</th>
                            <th className="text-left py-2">Producto</th>
                            <th className="text-right py-2">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.ticketVenta.productos.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-dashed">
                              <td className="py-2">{item.cantidad}</td>
                              <td className="py-2">
                                {item.nombre}
                                <div className="text-xs text-slate-500">
                                  ${Number(item.precio).toLocaleString('es-AR')} c/u
                                </div>
                              </td>
                              <td className="text-right py-2">
                                ${Number(item.subtotal).toLocaleString('es-AR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="border-t border-dashed mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <strong>${Number(p.ticketVenta.subtotal).toLocaleString('es-AR')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Descuento ({p.ticketVenta.descuentoPorcentaje}%)</span>
                          <span>-${Number(p.ticketVenta.descuentoImporte).toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black border-t pt-3">
                          <span>TOTAL</span>
                          <span>${Number(p.ticketVenta.total).toLocaleString('es-AR')}</span>
                        </div>
                      </div>

                      <p className="text-center text-xs mt-5">
                        Gracias por su compra.
                      </p>
                    </div>

                    <div className="p-4 border-t flex gap-3">
                      <button
                        type="button"
                        onClick={imprimirTicket}
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold"
                      >
                        Imprimir
                      </button>
                      <button
                        type="button"
                        onClick={() => p.setTicketVenta(null)}
                        className="flex-1 border py-3 rounded-xl font-bold"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          )
}

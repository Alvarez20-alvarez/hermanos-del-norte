import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import type { FormaPago, TipoVenta } from '../../tipos'

type Props = {
  ticketVenta: any
  setTicketVenta: any
  agregarProductoManual: any
  buscarCodigo: any
  cambiarCantidad: any
  cambiarClienteVenta: any
  carrito: any[]
  clienteVenta: any
  clientes: any[]
  codigoVenta: any
  confirmarVenta: (dineroRecibido?: number) => Promise<boolean>
  descuento: any
  descuentoNumero: number
  descuentoImporte: number
  formaPago: FormaPago
  guardandoVenta: boolean
  obtenerPrecio: any
  productoVentaSeleccionado: any
  productos: any[]
  setCodigoVenta: any
  setDescuento: any
  setFormaPago: any
  setProductoVentaSeleccionado: any
  setTipoVenta: any
  subtotalVenta: number
  tipoVenta: TipoVenta
  totalVenta: number
  usuarioLogueado: any
  salirDeCaja?: () => void
}

type CajaLocal = {
  abierta: boolean
  fondoInicial: number
  ventasEfectivo: number
  abiertaEn: string
}

const dinero = (valor: number) => `$${Number(valor || 0).toLocaleString('es-AR')}`

export default function Ventas(p: Props) {
  const fechaClave = new Date().toISOString().slice(0, 10)
  const usuarioClave = p.usuarioLogueado?.usuario || 'cajero'
  const claveCaja = `hdn_caja_${fechaClave}_${usuarioClave}`

  const [caja, setCaja] = useState<CajaLocal | null>(null)
  const [montoApertura, setMontoApertura] = useState('')
  const [dineroRecibido, setDineroRecibido] = useState('')
  const [efectivoContado, setEfectivoContado] = useState('')

  useEffect(() => {
    const guardada = localStorage.getItem(claveCaja)
    if (!guardada) return

    try {
      const datos = JSON.parse(guardada) as CajaLocal
      if (datos.abierta) setCaja(datos)
    } catch {
      localStorage.removeItem(claveCaja)
    }
  }, [claveCaja])

  const guardarCaja = (nueva: CajaLocal | null) => {
    setCaja(nueva)
    if (nueva) localStorage.setItem(claveCaja, JSON.stringify(nueva))
    else localStorage.removeItem(claveCaja)
  }

  const abrirCaja = async () => {
    const monto = Number(montoApertura)
    if (Number.isNaN(monto) || monto < 0) {
      await Swal.fire('Monto inválido', 'Ingresá un monto inicial válido.', 'warning')
      return
    }

    const resultado = await Swal.fire({
      title: 'Abrir caja',
      html: `La caja se abrirá con <b>${dinero(monto)}</b>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Abrir caja',
      cancelButtonText: 'Cancelar',
    })

    if (!resultado.isConfirmed) return

    guardarCaja({
      abierta: true,
      fondoInicial: monto,
      ventasEfectivo: 0,
      abiertaEn: new Date().toISOString(),
    })
    setMontoApertura('')
  }

  const esperadoEnCaja = useMemo(
    () => (caja?.fondoInicial || 0) + (caja?.ventasEfectivo || 0),
    [caja]
  )

  const recibidoNumero = Number(dineroRecibido || 0)
  const vuelto = p.formaPago === 'EFECTIVO' ? Math.max(0, recibidoNumero - p.totalVenta) : 0
  const faltaEfectivo =
    p.formaPago === 'EFECTIVO' && p.totalVenta > 0 && recibidoNumero < p.totalVenta

  const finalizarVenta = async () => {
    if (p.formaPago === 'EFECTIVO' && faltaEfectivo) {
      await Swal.fire({
        title: 'Dinero insuficiente',
        text: `Faltan ${dinero(p.totalVenta - recibidoNumero)} para completar la venta.`,
        icon: 'warning',
      })
      return
    }

    const correcta = await p.confirmarVenta(recibidoNumero)
    if (!correcta) return

    if (p.formaPago === 'EFECTIVO' && caja) {
      guardarCaja({ ...caja, ventasEfectivo: caja.ventasEfectivo + p.totalVenta })
    }

    setDineroRecibido('')
  }

  const cerrarCaja = async () => {
    if (!caja) return
    const contado = Number(efectivoContado)

    if (Number.isNaN(contado) || contado < 0) {
      await Swal.fire('Monto inválido', 'Ingresá cuánto efectivo hay realmente en la caja.', 'warning')
      return
    }

    const diferencia = contado - esperadoEnCaja
    const resultado = await Swal.fire({
      title: 'Cerrar caja',
      html: `
        <div style="text-align:left;line-height:1.8">
          <div>Fondo inicial: <b>${dinero(caja.fondoInicial)}</b></div>
          <div>Ventas en efectivo: <b>${dinero(caja.ventasEfectivo)}</b></div>
          <div>Esperado: <b>${dinero(esperadoEnCaja)}</b></div>
          <div>Contado: <b>${dinero(contado)}</b></div>
          <div>Diferencia: <b>${diferencia >= 0 ? '+' : '-'}${dinero(Math.abs(diferencia))}</b></div>
        </div>
      `,
      icon: diferencia === 0 ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar caja',
      cancelButtonText: 'Volver',
    })

    if (!resultado.isConfirmed) return

    guardarCaja(null)
    setEfectivoContado('')
    setDineroRecibido('')

    await Swal.fire('Caja cerrada', 'El turno quedó cerrado correctamente.', 'success')
    p.salirDeCaja?.()
  }

  const imprimirTicket = () => {
    const contenido = document.getElementById('ticket-venta')
    if (!contenido) return

    const ventana = window.open('', '_blank', 'width=450,height=700')
    if (!ventana) return

    ventana.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Ticket Hermanos del Norte</title><style>body{font-family:Arial,sans-serif;width:320px;margin:20px auto;color:#000}h1,h2,p{margin:5px 0}table{width:100%;border-collapse:collapse;margin-top:15px}th,td{padding:6px 2px;font-size:13px}th{border-bottom:1px solid #000}button{display:none}</style></head><body>${contenido.innerHTML}</body></html>`)
    ventana.document.close()
    ventana.focus()
    setTimeout(() => ventana.print(), 300)
  }

  if (!caja) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="bg-white border rounded-3xl p-8 w-full max-w-lg shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white grid place-items-center text-2xl mb-5">$</div>
          <h3 className="text-3xl font-black">Abrir caja</h3>
          <p className="text-slate-500 mt-2">
            Indicá con cuánto efectivo comienza el turno antes de registrar ventas.
          </p>

          <label className="font-semibold block mt-7 mb-2">Dinero inicial</label>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={montoApertura}
            onChange={(e) => setMontoApertura(e.target.value)}
            placeholder="Ej: 50000"
            className="w-full border-2 px-5 py-4 rounded-xl text-xl"
          />

          <button
            type="button"
            onClick={abrirCaja}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-5"
          >
            Abrir caja y comenzar
          </button>

          {p.salirDeCaja && (
            <button type="button" onClick={p.salirDeCaja} className="w-full border py-3 rounded-xl font-semibold mt-3">
              Volver al sistema
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h3 className="text-3xl font-bold">Caja / Ventas</h3>
          <p className="text-slate-500">Pantalla de venta del cajero.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="bg-white border rounded-xl px-4 py-2">
            <div className="text-xs text-slate-500">Caja inicial</div>
            <div className="font-black">{dinero(caja.fondoInicial)}</div>
          </div>
          <div className="bg-white border rounded-xl px-4 py-2">
            <div className="text-xs text-slate-500">Efectivo vendido</div>
            <div className="font-black">{dinero(caja.ventasEfectivo)}</div>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('cierre-caja')?.scrollIntoView({ behavior: 'smooth' })}
            className="border bg-white px-4 py-2 rounded-xl font-semibold"
          >
            Cerrar caja
          </button>
          {p.salirDeCaja && (
            <button type="button" onClick={p.salirDeCaja} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold">
              Salir de Ventas
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white border rounded-2xl p-6">
            <h4 className="text-xl font-bold">Código de barras</h4>
            <form onSubmit={p.buscarCodigo} className="flex gap-3 mt-4">
              <input
                autoFocus
                value={p.codigoVenta}
                onChange={(e) => p.setCodigoVenta(e.target.value)}
                placeholder="Escanear código..."
                className="flex-1 border-2 px-5 py-4 rounded-xl"
              />
              <button className="bg-slate-900 text-white px-6 rounded-xl">Buscar</button>
            </form>

            <div className="flex gap-3 mt-4">
              <select
                value={p.productoVentaSeleccionado}
                onChange={(e) => p.setProductoVentaSeleccionado(e.target.value)}
                className="flex-1 border px-4 py-3 rounded-xl"
              >
                <option value="">Agregar producto manualmente</option>
                {p.productos.map((producto: any) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - Stock {producto.stock}
                  </option>
                ))}
              </select>
              <button type="button" onClick={p.agregarProductoManual} className="border px-5 rounded-xl">Agregar</button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">Producto</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Cantidad</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {p.carrito.map((item: any) => {
                  const precio = p.obtenerPrecio(item.producto)
                  return (
                    <tr key={item.producto.id} className="border-t">
                      <td className="p-4 font-semibold">{item.producto.nombre}</td>
                      <td className="p-4 text-center">{dinero(precio)}</td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <button type="button" onClick={() => p.cambiarCantidad(item.producto.id, item.cantidad - 1)} className="border w-9 h-9 rounded-lg">-</button>
                          <span className="w-10 text-center font-bold">{item.cantidad}</span>
                          <button type="button" onClick={() => p.cambiarCantidad(item.producto.id, item.cantidad + 1)} className="border w-9 h-9 rounded-lg">+</button>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">{dinero(precio * item.cantidad)}</td>
                      <td className="p-4 text-center">
                        <button type="button" onClick={() => p.cambiarCantidad(item.producto.id, 0)} className="text-red-600 font-semibold">Quitar</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {p.carrito.length === 0 && <div className="p-10 text-center text-slate-500">No hay productos en la venta.</div>}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 h-fit">
          <h4 className="text-2xl font-bold">Resumen</h4>

          <label className="font-semibold block mt-5 mb-2">Cliente</label>
          <select value={p.clienteVenta} onChange={(e) => p.cambiarClienteVenta(e.target.value)} className="w-full border px-4 py-3 rounded-xl">
            <option value="">Consumidor final</option>
            {p.clientes.map((cliente: any) => <option key={cliente.id} value={cliente.id}>{cliente.nombre} - {cliente.tipo_cliente}</option>)}
          </select>

          <label className="font-semibold block mt-5 mb-2">Tipo de venta</label>
          <select value={p.tipoVenta} onChange={(e) => p.setTipoVenta(e.target.value as TipoVenta)} className="w-full border px-4 py-3 rounded-xl">
            <option value="MINORISTA">Minorista</option>
            <option value="MAYORISTA">Mayorista</option>
          </select>

          <label className="font-semibold block mt-5 mb-2">Forma de pago</label>
          <select value={p.formaPago} onChange={(e) => { p.setFormaPago(e.target.value as FormaPago); setDineroRecibido('') }} className="w-full border px-4 py-3 rounded-xl">
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
            <option value="OTRO">Otro</option>
          </select>

          <label className="font-semibold block mt-5 mb-2">Descuento (%)</label>
          <input type="number" min="0" max="100" value={p.descuento} onChange={(e) => p.setDescuento(e.target.value)} className="w-full border px-4 py-3 rounded-xl" />

          <div className="border-t mt-6 pt-5 space-y-3">
            <div className="flex justify-between"><span>Subtotal</span><strong>{dinero(p.subtotalVenta)}</strong></div>
            <div className="flex justify-between"><span>Descuento ({p.descuentoNumero}%)</span><span>-{dinero(p.descuentoImporte)}</span></div>
            <div className="flex justify-between text-2xl font-bold border-t pt-4"><span>TOTAL</span><span>{dinero(p.totalVenta)}</span></div>
          </div>

          {p.formaPago === 'EFECTIVO' && (
            <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <label className="font-bold block mb-2">Dinero recibido</label>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={dineroRecibido}
                onChange={(e) => setDineroRecibido(e.target.value)}
                placeholder={`Total: ${p.totalVenta}`}
                className="w-full border px-4 py-3 rounded-xl text-xl bg-white"
              />
              <div className="flex justify-between mt-4 text-xl">
                <span>Vuelto</span>
                <strong className={faltaEfectivo ? 'text-red-600' : 'text-emerald-700'}>
                  {faltaEfectivo ? `Falta ${dinero(p.totalVenta - recibidoNumero)}` : dinero(vuelto)}
                </strong>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={finalizarVenta}
            disabled={p.guardandoVenta || p.carrito.length === 0 || faltaEfectivo}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-6 disabled:opacity-40"
          >
            {p.guardandoVenta ? 'Registrando...' : 'Finalizar compra'}
          </button>
        </div>
      </div>

      <div id="cierre-caja" className="bg-white border rounded-2xl p-6 mt-6">
        <h4 className="text-xl font-bold">Cierre de caja</h4>
        <p className="text-slate-500 mt-1">Al finalizar el turno, contá el efectivo real y comparalo con el sistema.</p>
        <div className="grid md:grid-cols-4 gap-4 mt-5 items-end">
          <div><div className="text-sm text-slate-500">Fondo inicial</div><div className="text-xl font-black">{dinero(caja.fondoInicial)}</div></div>
          <div><div className="text-sm text-slate-500">Ventas efectivo</div><div className="text-xl font-black">{dinero(caja.ventasEfectivo)}</div></div>
          <div><div className="text-sm text-slate-500">Esperado</div><div className="text-xl font-black">{dinero(esperadoEnCaja)}</div></div>
          <div>
            <label className="text-sm font-semibold block mb-1">Efectivo contado</label>
            <input type="number" min="0" value={efectivoContado} onChange={(e) => setEfectivoContado(e.target.value)} className="w-full border px-3 py-3 rounded-xl" />
          </div>
        </div>
        <button type="button" onClick={cerrarCaja} className="mt-5 border border-red-300 text-red-700 px-5 py-3 rounded-xl font-bold">Cerrar caja del día</button>
      </div>

      {p.ticketVenta && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div id="ticket-venta" className="p-7">
              <div className="text-center"><h2 className="text-2xl font-black">HERMANOS DEL NORTE</h2><p className="text-sm">Distribuidora mayorista y minorista</p></div>
              <div className="border-t border-dashed my-4" />
              <div className="text-sm space-y-1">
                <p><strong>Venta:</strong> #{p.ticketVenta.venta_id}</p><p><strong>Fecha:</strong> {p.ticketVenta.fecha}</p><p><strong>Cliente:</strong> {p.ticketVenta.cliente}</p><p><strong>Empleado:</strong> {p.ticketVenta.usuario}</p><p><strong>Tipo:</strong> {p.ticketVenta.tipoVenta}</p><p><strong>Pago:</strong> {p.ticketVenta.formaPago}</p>
              </div>
              <table className="w-full mt-4 text-sm"><thead><tr className="border-b"><th className="text-left py-2">Cant.</th><th className="text-left py-2">Producto</th><th className="text-right py-2">Subtotal</th></tr></thead><tbody>{p.ticketVenta.productos.map((item: any, index: number) => <tr key={index} className="border-b border-dashed"><td className="py-2">{item.cantidad}</td><td className="py-2">{item.nombre}<div className="text-xs text-slate-500">{dinero(Number(item.precio))} c/u</div></td><td className="text-right py-2">{dinero(Number(item.subtotal))}</td></tr>)}</tbody></table>
              <div className="border-t border-dashed mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><strong>{dinero(Number(p.ticketVenta.subtotal))}</strong></div>
                <div className="flex justify-between"><span>Descuento ({p.ticketVenta.descuentoPorcentaje}%)</span><span>-{dinero(Number(p.ticketVenta.descuentoImporte))}</span></div>
                <div className="flex justify-between text-xl font-black border-t pt-3"><span>TOTAL</span><span>{dinero(Number(p.ticketVenta.total))}</span></div>
                {p.ticketVenta.formaPago === 'EFECTIVO' && <><div className="flex justify-between"><span>Recibido</span><span>{dinero(Number(p.ticketVenta.dineroRecibido || 0))}</span></div><div className="flex justify-between font-bold"><span>Vuelto</span><span>{dinero(Number(p.ticketVenta.vuelto || 0))}</span></div></>}
              </div>
              <p className="text-center text-xs mt-5">Gracias por su compra.</p>
            </div>
            <div className="p-4 border-t flex gap-3"><button type="button" onClick={imprimirTicket} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold">Imprimir</button><button type="button" onClick={() => p.setTicketVenta(null)} className="flex-1 border py-3 rounded-xl font-bold">Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

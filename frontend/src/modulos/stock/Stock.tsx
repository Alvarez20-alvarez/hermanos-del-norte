import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import EscanerCodigo from '../../componentes/EscanerCodigo'
import type {
  FormMovimiento,
  MovimientoStock,
  Producto,
  Rol,
  TipoMovimiento,
} from '../../tipos'

type Props = {
  rol: Rol
  registrarMovimiento: (e: FormEvent) => void
  formularioMovimiento: FormMovimiento
  setFormularioMovimiento: Dispatch<SetStateAction<FormMovimiento>>
  productos: Producto[]
  productoStockSeleccionado?: Producto
  busquedaStock: string
  setBusquedaStock: Dispatch<SetStateAction<string>>
  productosStock: Producto[]
  editandoStockMasivo: boolean
  iniciarEdicionStockMasivo: () => void
  cancelarEdicionStockMasivo: () => void
  guardarStockMasivo: () => void
  guardandoStockMasivo: boolean
  stockEditable: Record<number, string>
  setStockEditable: Dispatch<SetStateAction<Record<number, string>>>
  movimientos: MovimientoStock[]
}

export default function Stock({
  rol,
  registrarMovimiento,
  formularioMovimiento,
  setFormularioMovimiento,
  productos,
  productoStockSeleccionado,
  busquedaStock,
  setBusquedaStock,
  productosStock,
  editandoStockMasivo,
  iniciarEdicionStockMasivo,
  cancelarEdicionStockMasivo,
  guardarStockMasivo,
  guardandoStockMasivo,
  stockEditable,
  setStockEditable,
  movimientos,
}: Props) {
  const puedeEditarMasivo = rol === 'Repositor' || rol === 'Administrador'
  const [escanerAbierto, setEscanerAbierto] = useState(false)

  const usarCodigoEscaneado = (codigo: string) => {
    const producto = productos.find(
      (item) => item.codigo_barras === codigo
    )

    if (!producto) {
      setBusquedaStock(codigo)
      alert(
        'No encontré un producto con ese código. Podés cargarlo desde Productos → Editar todo.'
      )
      return
    }

    setBusquedaStock(producto.nombre)

    setFormularioMovimiento({
      ...formularioMovimiento,
      producto_id: String(producto.id),
    })
  }

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold">
            Control de stock
          </h3>
          <p className="text-slate-500 mt-1">
            Desde el celular podés escanear un producto y actualizarlo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEscanerAbierto(true)}
          className="border bg-white px-5 py-3 rounded-xl font-semibold w-full sm:w-auto"
        >
          📷 Escanear producto
        </button>
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mt-6">
        <form
          onSubmit={registrarMovimiento}
          className="bg-white border rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <h4 className="text-xl font-bold">Movimiento individual</h4>

          <select
            value={formularioMovimiento.producto_id}
            onChange={(e) =>
              setFormularioMovimiento({
                ...formularioMovimiento,
                producto_id: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>

          {productoStockSeleccionado && (
            <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between">
              <span>Stock actual</span>
              <strong className="text-2xl">
                {productoStockSeleccionado.stock}
              </strong>
            </div>
          )}

          <select
            value={formularioMovimiento.tipo}
            onChange={(e) =>
              setFormularioMovimiento({
                ...formularioMovimiento,
                tipo: e.target.value as TipoMovimiento,
              })
            }
            className="w-full border p-3 rounded-xl"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
            <option value="AJUSTE">Ajuste</option>
          </select>

          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Cantidad"
            value={formularioMovimiento.cantidad}
            onChange={(e) =>
              setFormularioMovimiento({
                ...formularioMovimiento,
                cantidad: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl text-lg"
          />

          <input
            placeholder="Motivo"
            value={formularioMovimiento.motivo}
            onChange={(e) =>
              setFormularioMovimiento({
                ...formularioMovimiento,
                motivo: e.target.value,
              })
            }
            className="w-full border p-3 rounded-xl"
          />

          <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-semibold">
            Registrar movimiento
          </button>
        </form>

        <div className="xl:col-span-2 bg-white border rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xl font-bold">Inventario</h4>
              <p className="text-sm text-slate-500 mt-1">
                Editá varias cantidades y guardalas todas juntas.
              </p>
            </div>

            {puedeEditarMasivo && !editandoStockMasivo && (
              <button
                type="button"
                onClick={iniciarEdicionStockMasivo}
                className="bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold"
              >
                Editar todo
              </button>
            )}
          </div>

          <input
            value={busquedaStock}
            onChange={(e) => setBusquedaStock(e.target.value)}
            placeholder="Buscar producto..."
            className="border p-3 rounded-xl mb-4 w-full"
          />

          {/* Celular */}
          <div className="md:hidden space-y-3">
            {productosStock.map((producto) => (
              <div
                key={producto.id}
                className="border rounded-2xl p-4"
              >
                <div className="flex justify-between gap-3 items-start">
                  <div>
                    <h5 className="font-bold text-lg">
                      {producto.nombre}
                    </h5>
                    <p className="text-sm text-slate-500">
                      {producto.presentacion || '-'}
                    </p>
                  </div>

                  {editandoStockMasivo && puedeEditarMasivo ? (
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        stockEditable[producto.id] ??
                        String(producto.stock)
                      }
                      onChange={(e) =>
                        setStockEditable((anterior) => ({
                          ...anterior,
                          [producto.id]: e.target.value,
                        }))
                      }
                      className="w-24 border px-3 py-3 rounded-xl text-center text-xl font-bold"
                    />
                  ) : (
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        Stock
                      </div>
                      <div className="text-3xl font-black">
                        {producto.stock}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Escritorio */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Producto</th>
                  <th className="p-3 text-left">Presentación</th>
                  <th className="p-3 text-center">Stock</th>
                </tr>
              </thead>

              <tbody>
                {productosStock.map((producto) => (
                  <tr key={producto.id} className="border-t">
                    <td className="p-3 font-semibold">
                      {producto.nombre}
                    </td>

                    <td className="p-3 text-slate-500">
                      {producto.presentacion || '-'}
                    </td>

                    <td className="p-3 text-center">
                      {editandoStockMasivo && puedeEditarMasivo ? (
                        <input
                          type="number"
                          min="0"
                          value={
                            stockEditable[producto.id] ??
                            String(producto.stock)
                          }
                          onChange={(e) =>
                            setStockEditable((anterior) => ({
                              ...anterior,
                              [producto.id]: e.target.value,
                            }))
                          }
                          className="w-28 border px-3 py-2 rounded-lg text-center"
                        />
                      ) : (
                        <span className="font-bold">
                          {producto.stock}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 sm:p-6 mt-6">
        <h4 className="text-xl font-bold mb-4">
          Historial de movimientos
        </h4>

        <div className="space-y-2">
          {movimientos.map((movimiento) => (
            <div
              key={movimiento.id}
              className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b py-3 text-sm"
            >
              <span className="font-semibold">
                {movimiento.producto}
              </span>
              <span>{movimiento.tipo}</span>
              <span>{movimiento.cantidad}</span>
              <span>
                {movimiento.stock_anterior}
                {' → '}
                {movimiento.stock_nuevo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {editandoStockMasivo && puedeEditarMasivo && (
        <div className="fixed md:static bottom-0 left-0 right-0 z-40 bg-white border-t md:border md:rounded-2xl p-3 md:mt-4 shadow-2xl md:shadow-none">
          <div className="max-w-5xl mx-auto flex gap-2">
            <button
              type="button"
              onClick={cancelarEdicionStockMasivo}
              disabled={guardandoStockMasivo}
              className="flex-1 border px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarStockMasivo}
              disabled={guardandoStockMasivo}
              className="flex-[2] bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {guardandoStockMasivo
                ? 'Guardando...'
                : 'Guardar todos'}
            </button>
          </div>
        </div>
      )}

      <EscanerCodigo
        abierto={escanerAbierto}
        titulo="Escanear producto"
        cerrar={() => setEscanerAbierto(false)}
        alDetectar={usarCodigoEscaneado}
      />
    </div>
  )
}

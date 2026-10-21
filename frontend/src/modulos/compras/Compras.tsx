
type Props = {
  agregarProductoCompra: any
  cambiarCantidadCompra: any
  cambiarPrecioCompra: any
  cantidadCompra: any
  carritoCompra: any
  compras: any
  confirmarCompra: any
  eliminarProductoCompra: any
  guardandoCompra: any
  observacionCompra: any
  precioCompra: any
  productoCompra: any
  productos: any
  proveedorCompra: any
  proveedores: any
  seleccionarProductoCompra: any
  setCantidadCompra: any
  setObservacionCompra: any
  setPrecioCompra: any
  setProveedorCompra: any
  totalCompra: any
}

export default function Compras(p: Props) {
  return (

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
                  p.proveedorCompra
                }
                onChange={(e) =>
                  p.setProveedorCompra(
                    e.target.value
                  )
                }
                className="w-full border px-4 py-3 rounded-xl"
              >

                <option value="">
                  Sin proveedor
                </option>

                {p.proveedores.map(
                  (proveedor: any) => (

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
                  p.productoCompra
                }
                onChange={(e) =>
                  p.seleccionarProductoCompra(
                    e.target.value
                  )
                }
                className="w-full border px-4 py-3 rounded-xl"
              >

                <option value="">
                  Seleccionar producto
                </option>

                {p.productos.map(
                  (producto: any) => (

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
                  p.cantidadCompra
                }
                onChange={(e) =>
                  p.setCantidadCompra(
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
                  p.precioCompra
                }
                onChange={(e) =>
                  p.setPrecioCompra(
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
              p.agregarProductoCompra
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

              {p.carritoCompra.map(
                (item: any) => (

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
                          p.cambiarCantidadCompra(
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
                          p.cambiarPrecioCompra(
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
                          p.eliminarProductoCompra(
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

          {p.carritoCompra.length ===
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
              p.observacionCompra
            }
            onChange={(e) =>
              p.setObservacionCompra(
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
                p.carritoCompra.length
              }
            </strong>

          </div>

          <div className="flex justify-between text-2xl font-bold mt-5 border-t pt-5">

            <span>
              TOTAL
            </span>

            <span>
              $
              {p.totalCompra.toLocaleString(
                'es-AR'
              )}
            </span>

          </div>

        </div>

        <button
          onClick={
            p.confirmarCompra
          }
          disabled={
            p.guardandoCompra ||
            p.carritoCompra.length === 0
          }
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-6 disabled:opacity-40"
        >
          {p.guardandoCompra
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

          {p.compras
            .slice(0, 15)
            .map(
              (compra: any) => (

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

      {p.compras.length === 0 && (

        <div className="p-10 text-center text-slate-500">
          Todavía no hay compras registradas.
        </div>

      )}

    </div>

  </div>

)
}

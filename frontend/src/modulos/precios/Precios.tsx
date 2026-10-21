
type Props = {
  busquedaPrecio: any
  calcularMargen: any
  cambiarPrecio: any
  guardarPreciosProducto: any
  obtenerPrecioCampo: any
  preciosEditables: any
  productosPrecioFiltrados: any
  setBusquedaPrecio: any
}

export default function Precios(p: Props) {
  return (

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
          p.busquedaPrecio
        }
        onChange={(e) =>
          p.setBusquedaPrecio(
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

          {p.productosPrecioFiltrados.map(
            (producto: any) => {

              const costo =
                Number(
                  p.obtenerPrecioCampo(
                    producto,
                    'precio_compra'
                  )
                ) || 0

              const minorista =
                Number(
                  p.obtenerPrecioCampo(
                    producto,
                    'precio_minorista'
                  )
                ) || 0

              const mayorista =
                Number(
                  p.obtenerPrecioCampo(
                    producto,
                    'precio_mayorista'
                  )
                ) || 0

              const margenMinorista =
                p.calcularMargen(
                  costo,
                  minorista
                )

              const margenMayorista =
                p.calcularMargen(
                  costo,
                  mayorista
                )

              const tieneCambios =
                Boolean(
                  p.preciosEditables[
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
                        p.obtenerPrecioCampo(
                          producto,
                          'precio_compra'
                        )
                      }
                      onChange={(e) =>
                        p.cambiarPrecio(
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
                        p.obtenerPrecioCampo(
                          producto,
                          'precio_minorista'
                        )
                      }
                      onChange={(e) =>
                        p.cambiarPrecio(
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
                        p.obtenerPrecioCampo(
                          producto,
                          'precio_mayorista'
                        )
                      }
                      onChange={(e) =>
                        p.cambiarPrecio(
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
                        p.guardarPreciosProducto(
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

      {p.productosPrecioFiltrados.length ===
        0 && (

        <div className="p-10 text-center text-slate-500">
          No se encontraron productos.
        </div>

      )}

    </div>

  </div>

)
}

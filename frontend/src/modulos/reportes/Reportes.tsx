
type Props = {
  cargandoReporte: any
  cargarReporte: any
  reporte: any
  reporteDesde: any
  reporteHasta: any
  setReporteDesde: any
  setReporteHasta: any
}

export default function Reportes(p: Props) {
  return (

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
              p.reporteDesde
            }
            onChange={(e) =>
              p.setReporteDesde(
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
              p.reporteHasta
            }
            onChange={(e) =>
              p.setReporteHasta(
                e.target.value
              )
            }
            className="border px-4 py-3 rounded-xl"
          />

        </div>

        <button
          onClick={() =>
            p.cargarReporte()
          }
          disabled={
            p.cargandoReporte
          }
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {p.cargandoReporte
            ? 'Cargando...'
            : 'Generar reporte'}
        </button>

      </div>

    </div>

    {p.reporte && (

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
        p.reporte.ventas.total
      ).toLocaleString(
        'es-AR'
      )}
    </p>

    <p className="text-sm text-slate-500 mt-2">
      {p.reporte.ventas.cantidad} ventas
    </p>

  </div>

  <div className="bg-white border rounded-2xl p-6">

    <p className="text-slate-500">
      Costo vendido
    </p>

    <p className="text-3xl font-bold mt-1">
      $
      {Number(
        p.reporte.rentabilidad
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
        p.reporte.rentabilidad
          .ganancia_bruta >= 0
          ? 'text-green-700'
          : 'text-red-700'
      }`}
    >
      $
      {Number(
        p.reporte.rentabilidad
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
        p.reporte.rentabilidad
          .margen >= 0
          ? 'text-blue-700'
          : 'text-red-700'
      }`}
    >
      {Number(
        p.reporte.rentabilidad
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

                {p.reporte.productos_mas_vendidos.map(
                  (producto: any) => (

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

            {p.reporte.productos_mas_vendidos.length ===
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

                {p.reporte.ventas_por_pago.map(
                  (pago: any) => (

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

                {p.reporte.productos_mas_rentables.map(
                  (producto: any) => (

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

          {p.reporte.productos_mas_rentables.length ===
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

              {p.reporte.ventas_por_dia.map(
                (dia: any) => (

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

              {p.reporte.stock_bajo.map(
                (producto: any) => (

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

          {p.reporte.stock_bajo.length ===
            0 && (

            <div className="p-8 text-center text-slate-500">
              No hay productos con stock bajo.
            </div>

          )}

        </div>

      </>

    )}

  </div>

)
}

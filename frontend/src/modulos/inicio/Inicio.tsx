import Tarjeta from '../../componentes/Tarjeta'

type Props = {
  clientes: any
  reporte: any
  stockBajo: any
  usuarioLogueado: any
}

export default function Inicio(p: Props) {
  return (

            <div>

              <div>

                <h3 className="text-3xl font-black tracking-tight">
                  Panel principal
                </h3>

                <p className="text-slate-500 mt-1">
                  Bienvenido, {p.usuarioLogueado.nombre}.
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mt-8">

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-500">
                    Ventas de hoy
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    $
                    {Number(
                      p.reporte?.ventas.total || 0
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    {p.reporte?.ventas.cantidad || 0} operaciones
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-500">
                    Ganancia bruta
                  </p>

                  <p className="text-3xl font-bold mt-1 text-green-700">
                    $
                    {Number(
                      p.reporte?.rentabilidad
                        .ganancia_bruta || 0
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    Margen{' '}
                    {Number(
                      p.reporte?.rentabilidad
                        .margen || 0
                    ).toFixed(1)}
                    %
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-500">
                    Compras de hoy
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    $
                    {Number(
                      p.reporte?.compras.total || 0
                    ).toLocaleString(
                      'es-AR'
                    )}
                  </p>

                  <p className="text-sm text-slate-400 mt-2">
                    {p.reporte?.compras.cantidad || 0} compras
                  </p>
                </div>

                <Tarjeta
                  titulo="Stock bajo"
                  valor={p.stockBajo}
                />

                <Tarjeta
                  titulo="Clientes"
                  valor={p.clientes.length}
                />

              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

                  <div className="p-5 border-b">

                    <h4 className="text-xl font-bold">
                      Productos más vendidos hoy
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      Ranking según las ventas del día.
                    </p>

                  </div>

                  {p.reporte &&
                  p.reporte.productos_mas_vendidos.length >
                    0 ? (

                    <div>

                      {p.reporte.productos_mas_vendidos
                        .slice(0, 5)
                        .map(
                          (
                            producto: any,
                            indice: number
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

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

                  <div className="p-5 border-b">

                    <h4 className="text-xl font-bold">
                      Alertas de stock
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      Productos que necesitan reposición.
                    </p>

                  </div>

                  {p.reporte &&
                  p.reporte.stock_bajo.length >
                    0 ? (

                    <div>

                      {p.reporte.stock_bajo
                        .slice(0, 6)
                        .map(
                          (producto: any) => (

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

          )
}

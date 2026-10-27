import { useEffect, useState } from 'react'
import type { TipoVenta } from '../../tipos'

type Props = {
  busquedaCliente: any
  clientesFiltrados: any
  editarCliente: any
  eliminarCliente: any
  formularioCliente: any
  guardarCliente: any
  mostrarFormularioCliente: any
  nuevoCliente: any
  setBusquedaCliente: any
  setFormularioCliente: any
  setMostrarFormularioCliente: any
  usuarioLogueado: any
}

export default function Clientes(p: Props) {
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const totalPaginas = Math.max(1, Math.ceil(p.clientesFiltrados.length / porPagina))
  const inicioPagina = (pagina - 1) * porPagina
  const clientesPagina = p.clientesFiltrados.slice(inicioPagina, inicioPagina + porPagina)

  useEffect(() => setPagina(1), [p.busquedaCliente, porPagina])
  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas)
  }, [pagina, totalPaginas])

  return (

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
                    p.nuevoCliente
                  }
                  className="bg-slate-900 text-white px-5 py-3 rounded-xl"
                >
                  + Nuevo cliente
                </button>

              </div>

              {p.mostrarFormularioCliente && (

                <form
                  onSubmit={
                    p.guardarCliente
                  }
                  className="bg-white border p-6 rounded-2xl mt-6 grid md:grid-cols-2 gap-4"
                >

                  <input
                    required
                    placeholder="Nombre"
                    value={
                      p.formularioCliente.nombre
                    }
                    onChange={(e) =>
                      p.setFormularioCliente({
                        ...p.formularioCliente,
                        nombre:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <input
                    placeholder="DNI / CUIT"
                    value={
                      p.formularioCliente.dni_cuit
                    }
                    onChange={(e) =>
                      p.setFormularioCliente({
                        ...p.formularioCliente,
                        dni_cuit:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <input
                    placeholder="Teléfono"
                    value={
                      p.formularioCliente.telefono
                    }
                    onChange={(e) =>
                      p.setFormularioCliente({
                        ...p.formularioCliente,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <input
                    placeholder="Dirección"
                    value={
                      p.formularioCliente.direccion
                    }
                    onChange={(e) =>
                      p.setFormularioCliente({
                        ...p.formularioCliente,
                        direccion:
                          e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />

                  <select
                    value={
                      p.formularioCliente.tipo_cliente
                    }
                    onChange={(e) =>
                      p.setFormularioCliente({
                        ...p.formularioCliente,
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
                        p.setMostrarFormularioCliente(
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
                  p.busquedaCliente
                }
                onChange={(e) =>
                  p.setBusquedaCliente(
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

                    {clientesPagina.map(
                      (cliente: any) => (

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
                                  p.editarCliente(
                                    cliente
                                  )
                                }
                                className="bg-slate-100 px-4 py-2 rounded-lg"
                              >
                                Editar
                              </button>

                              {p.usuarioLogueado.rol ===
                                'Administrador' && (

                                <button
                                  onClick={() =>
                                    p.eliminarCliente(
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

            <div className="mt-5 bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm text-slate-500">Mostrando {p.clientesFiltrados.length === 0 ? 0 : inicioPagina + 1}–{Math.min(inicioPagina + porPagina, p.clientesFiltrados.length)} de {p.clientesFiltrados.length}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))} className="border px-3 py-2 rounded-lg"><option value={10}>10 por página</option><option value={20}>20 por página</option><option value={50}>50 por página</option></select>
                  <button type="button" disabled={pagina <= 1} onClick={() => setPagina((v) => Math.max(1, v - 1))} className="border px-3 py-2 rounded-lg disabled:opacity-40">Anterior</button>
                  <span className="font-semibold">{pagina} / {totalPaginas}</span>
                  <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina((v) => Math.min(totalPaginas, v + 1))} className="border px-3 py-2 rounded-lg disabled:opacity-40">Siguiente</button>
                </div>
              </div>

              </div>

          )
}

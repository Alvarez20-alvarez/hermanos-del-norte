import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react'
import { API } from '../../config/api'
import Swal from 'sweetalert2'
import EscanerCodigo from '../../componentes/EscanerCodigo'
import type { FormProducto, Producto, Rol } from '../../tipos'

type Props = {
  rol: Rol
  nuevoProducto: () => void
  mostrarFormularioProducto: boolean
  guardarProducto: (e: FormEvent) => void
  formularioProducto: FormProducto
  setFormularioProducto: Dispatch<SetStateAction<FormProducto>>
  busquedaProducto: string
  setBusquedaProducto: Dispatch<SetStateAction<string>>
  productosFiltrados: Producto[]
  editarProducto: (producto: Producto) => void
  cargarProductos: () => Promise<void>
}

type ProductoEditable = {
  codigo_barras: string
  nombre: string
  categoria: string
  presentacion: string
  stock_minimo: string
}

export default function Productos({
  rol,
  nuevoProducto,
  mostrarFormularioProducto,
  guardarProducto,
  formularioProducto,
  setFormularioProducto,
  busquedaProducto,
  setBusquedaProducto,
  productosFiltrados,
  editarProducto,
  cargarProductos,
}: Props) {
  const esAdministrador = rol === 'Administrador'
  const esRepositor = rol === 'Repositor'

  const [editandoTodo, setEditandoTodo] = useState(false)
  const [guardandoTodo, setGuardandoTodo] = useState(false)
  const [productosEditables, setProductosEditables] =
    useState<Record<number, ProductoEditable>>({})

  const [escanerAbierto, setEscanerAbierto] = useState(false)
  const [productoEscaneandoId, setProductoEscaneandoId] =
    useState<number | null>(null)

  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / porPagina))
  const inicioPagina = (pagina - 1) * porPagina
  const productosPagina = productosFiltrados.slice(inicioPagina, inicioPagina + porPagina)

  const cambiarCampo = (
    campo: keyof FormProducto,
    valor: string
  ) => {
    setFormularioProducto({
      ...formularioProducto,
      [campo]: valor,
    })
  }

  const prepararEdicionMasiva = () => {
    const valores: Record<number, ProductoEditable> = {}

    productosFiltrados.forEach((producto) => {
      valores[producto.id] = {
        codigo_barras: producto.codigo_barras || '',
        nombre: producto.nombre,
        categoria: producto.categoria || '',
        presentacion: producto.presentacion || '',
        stock_minimo: String(producto.stock_minimo ?? 0),
      }
    })

    setProductosEditables(valores)
    setEditandoTodo(true)
  }

  const cancelarEdicionMasiva = () => {
    setEditandoTodo(false)
    setProductosEditables({})
  }

  const cambiarProductoMasivo = (
    productoId: number,
    campo: keyof ProductoEditable,
    valor: string
  ) => {
    setProductosEditables((actuales) => ({
      ...actuales,
      [productoId]: {
        ...actuales[productoId],
        [campo]: valor,
      },
    }))
  }

  const guardarTodosLosProductos = async () => {
    const cambios = productosFiltrados.filter((producto) => {
      const editado = productosEditables[producto.id]
      if (!editado) return false

      return (
        editado.codigo_barras !== (producto.codigo_barras || '') ||
        editado.nombre !== producto.nombre ||
        editado.categoria !== (producto.categoria || '') ||
        editado.presentacion !== (producto.presentacion || '') ||
        Number(editado.stock_minimo) !== Number(producto.stock_minimo)
      )
    })

    if (cambios.length === 0) {
      await Swal.fire('Sin cambios', 'No realizaste cambios en los productos.', 'info')
      return
    }

    const invalido = cambios.some((producto) => {
      const editado = productosEditables[producto.id]

      return (
        !editado.nombre.trim() ||
        Number.isNaN(Number(editado.stock_minimo)) ||
        Number(editado.stock_minimo) < 0
      )
    })

    if (invalido) {
      await Swal.fire('Revisá los datos', 'El nombre no puede quedar vacío y el stock mínimo no puede ser negativo.', 'warning')
      return
    }

    const confirmacion = await Swal.fire({
      title: 'Guardar cambios',
      text: `Se modificaron ${cambios.length} producto${cambios.length === 1 ? '' : 's'}. ¿Querés guardar los cambios?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    })

    if (!confirmacion.isConfirmed) return

    try {
      setGuardandoTodo(true)

      for (const producto of cambios) {
        const editado = productosEditables[producto.id]

        const respuesta = await fetch(
          `${API}/productos/${producto.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              codigo_barras: editado.codigo_barras,
              nombre: editado.nombre.trim(),
              categoria: editado.categoria,
              presentacion: editado.presentacion,
              precio_compra: producto.precio_compra,
              precio_minorista: producto.precio_minorista,
              precio_mayorista: producto.precio_mayorista,
              cantidad_min_mayorista:
                producto.cantidad_min_mayorista,
              stock: producto.stock,
              stock_minimo: Number(editado.stock_minimo),
            }),
          }
        )

        const datos = await respuesta.json()

        if (!respuesta.ok) {
          throw new Error(
            datos.mensaje ||
              `No se pudo actualizar ${producto.nombre}`
          )
        }
      }

      await cargarProductos()
      setEditandoTodo(false)
      setProductosEditables({})

      await Swal.fire('Listo', 'Productos actualizados correctamente.', 'success')
    } catch (error) {
      await Swal.fire('Error', error instanceof Error ? error.message : 'No se pudieron guardar los cambios', 'error')
    } finally {
      setGuardandoTodo(false)
    }
  }

  const escanearParaBuscar = (codigo: string) => {
    const encontrado = productosFiltrados.find(
      (producto) => producto.codigo_barras === codigo
    )

    if (encontrado) {
      setBusquedaProducto(encontrado.nombre)
      return
    }

    setBusquedaProducto(codigo)
    void Swal.fire('Código no encontrado', 'No encontré un producto con ese código. Podés asignarlo desde Editar todo.', 'info')
  }

  const escanearParaProducto = (codigo: string) => {
    if (productoEscaneandoId === null) return

    cambiarProductoMasivo(
      productoEscaneandoId,
      'codigo_barras',
      codigo
    )
    setProductoEscaneandoId(null)
  }

  useEffect(() => {
    setPagina(1)
  }, [busquedaProducto, porPagina])

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas)
  }, [pagina, totalPaginas])

  useEffect(() => {
    if (!editandoTodo) return

    setProductosEditables((actuales) => {
      const copia = { ...actuales }

      productosFiltrados.forEach((producto) => {
        if (!copia[producto.id]) {
          copia[producto.id] = {
            codigo_barras: producto.codigo_barras || '',
            nombre: producto.nombre,
            categoria: producto.categoria || '',
            presentacion: producto.presentacion || '',
            stock_minimo: String(producto.stock_minimo ?? 0),
          }
        }
      })

      return copia
    })
  }, [productosFiltrados, editandoTodo])

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-start">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold">Productos</h3>
          <p className="text-slate-500">
            {esRepositor
              ? 'Trabajá desde el celular: buscá, escaneá y corregí datos.'
              : 'Catálogo, precios y existencias.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2">
          {esRepositor && (
            <button
              type="button"
              onClick={() => {
                setProductoEscaneandoId(null)
                setEscanerAbierto(true)
              }}
              className="border px-4 py-3 rounded-xl font-semibold bg-white"
            >
              📷 Escanear
            </button>
          )}

          {esRepositor && !editandoTodo && (
            <button
              type="button"
              onClick={prepararEdicionMasiva}
              className="bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold"
            >
              Editar todo
            </button>
          )}

          {(esAdministrador || esRepositor) && (
            <button
              onClick={nuevoProducto}
              className="bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold"
            >
              + Nuevo producto
            </button>
          )}
        </div>
      </div>

      {mostrarFormularioProducto && (esAdministrador || esRepositor) && (
        <form
          onSubmit={guardarProducto}
          className="bg-white border rounded-2xl p-5 sm:p-6 mt-6"
        >
          <h4 className="text-xl font-bold mb-2">Producto</h4>
          {esRepositor && (
            <p className="text-sm text-slate-500 mb-5">
              El repositor puede cargar los datos del producto. Los precios quedan para el administrador.
            </p>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['codigo_barras', 'Código de barras'],
              ['nombre', 'Nombre'],
              ['categoria', 'Categoría'],
              ['presentacion', 'Presentación'],
            ].map(([campo, placeholder]) => (
              <input
                key={campo}
                value={formularioProducto[campo as keyof FormProducto] as string}
                onChange={(e) =>
                  cambiarCampo(
                    campo as keyof FormProducto,
                    e.target.value
                  )
                }
                placeholder={placeholder}
                className="border p-3 rounded-xl"
              />
            ))}

            {esAdministrador && (
              <>
                <input type="number" min="0" value={formularioProducto.precio_compra} onChange={(e) => cambiarCampo('precio_compra', e.target.value)} placeholder="Precio compra" className="border p-3 rounded-xl" />
                <input type="number" min="0" value={formularioProducto.precio_minorista} onChange={(e) => cambiarCampo('precio_minorista', e.target.value)} placeholder="Precio minorista" className="border p-3 rounded-xl" />
                <input type="number" min="0" value={formularioProducto.precio_mayorista} onChange={(e) => cambiarCampo('precio_mayorista', e.target.value)} placeholder="Precio mayorista" className="border p-3 rounded-xl" />
                <input type="number" min="1" value={formularioProducto.cantidad_min_mayorista} onChange={(e) => cambiarCampo('cantidad_min_mayorista', e.target.value)} placeholder="Cantidad mínima mayorista" className="border p-3 rounded-xl" />
              </>
            )}

            <input
              type="number"
              min="0"
              value={formularioProducto.stock}
              onChange={(e) =>
                cambiarCampo('stock', e.target.value)
              }
              placeholder="Stock"
              className="border p-3 rounded-xl"
            />

            <input
              type="number"
              min="0"
              value={formularioProducto.stock_minimo}
              onChange={(e) =>
                cambiarCampo('stock_minimo', e.target.value)
              }
              placeholder="Stock mínimo"
              className="border p-3 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold mt-5 w-full sm:w-auto"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="mt-6 flex gap-2">
        <input
          value={busquedaProducto}
          onChange={(e) => setBusquedaProducto(e.target.value)}
          placeholder="Buscar producto..."
          className="border p-3 rounded-xl w-full"
        />
      </div>

      {esRepositor && editandoTodo && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          Tocá <strong>Escanear código</strong> dentro de cada producto
          para cargar el código con la cámara. Al terminar, guardá todo junto.
        </div>
      )}

      {/* Vista móvil: tarjetas cómodas para usar con una mano */}
      <div className="md:hidden space-y-3 mt-5">
        {productosPagina.map((producto) => {
          const editable = productosEditables[producto.id]

          return (
            <div
              key={producto.id}
              className="bg-white border rounded-2xl p-4"
            >
              {esRepositor && editandoTodo ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      PRODUCTO
                    </label>
                    <input
                      value={editable?.nombre ?? ''}
                      onChange={(e) =>
                        cambiarProductoMasivo(
                          producto.id,
                          'nombre',
                          e.target.value
                        )
                      }
                      className="border px-3 py-3 rounded-xl w-full mt-1 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      CÓDIGO DE BARRAS
                    </label>

                    <div className="flex gap-2 mt-1">
                      <input
                        value={editable?.codigo_barras ?? ''}
                        onChange={(e) =>
                          cambiarProductoMasivo(
                            producto.id,
                            'codigo_barras',
                            e.target.value
                          )
                        }
                        inputMode="numeric"
                        className="border px-3 py-3 rounded-xl flex-1 min-w-0"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setProductoEscaneandoId(producto.id)
                          setEscanerAbierto(true)
                        }}
                        className="bg-slate-900 text-white px-4 rounded-xl font-semibold"
                      >
                        📷
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        CATEGORÍA
                      </label>
                      <input
                        value={editable?.categoria ?? ''}
                        onChange={(e) =>
                          cambiarProductoMasivo(
                            producto.id,
                            'categoria',
                            e.target.value
                          )
                        }
                        className="border px-3 py-3 rounded-xl w-full mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        PRESENTACIÓN
                      </label>
                      <input
                        value={editable?.presentacion ?? ''}
                        onChange={(e) =>
                          cambiarProductoMasivo(
                            producto.id,
                            'presentacion',
                            e.target.value
                          )
                        }
                        className="border px-3 py-3 rounded-xl w-full mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className="text-xs font-bold text-slate-500">
                        STOCK MÍNIMO
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editable?.stock_minimo ?? '0'}
                        onChange={(e) =>
                          cambiarProductoMasivo(
                            producto.id,
                            'stock_minimo',
                            e.target.value
                          )
                        }
                        className="border px-3 py-3 rounded-xl w-full mt-1"
                      />
                    </div>

                    <div className="bg-slate-100 rounded-xl p-3">
                      <div className="text-xs text-slate-500">Stock actual</div>
                      <div className="text-xl font-bold">{producto.stock}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-lg">
                        {producto.nombre}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {producto.presentacion || 'Sin presentación'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">Stock</div>
                      <div className="text-2xl font-black">
                        {producto.stock}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t text-sm">
                    <span className="text-slate-500">Código: </span>
                    <strong>{producto.codigo_barras || 'Sin cargar'}</strong>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Escritorio: tabla tradicional */}
      <div className="hidden md:block bg-white border rounded-2xl mt-5 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Código</th>
              <th className="p-4 text-left">Producto</th>

              {esRepositor && editandoTodo && (
                <>
                  <th className="p-4 text-left">Categoría</th>
                  <th className="p-4 text-left">Presentación</th>
                  <th className="p-4 text-center">Stock mínimo</th>
                </>
              )}

              <th className="p-4">Minorista</th>
              <th className="p-4">Mayorista</th>
              <th className="p-4">Stock</th>

              {esAdministrador && (
                <th className="p-4 text-center">Acción</th>
              )}
            </tr>
          </thead>

          <tbody>
            {productosPagina.map((producto) => {
              const editable = productosEditables[producto.id]

              return (
                <tr key={producto.id} className="border-t">
                  <td className="p-3">
                    {esRepositor && editandoTodo ? (
                      <div className="flex gap-2">
                        <input
                          value={editable?.codigo_barras ?? ''}
                          onChange={(e) =>
                            cambiarProductoMasivo(
                              producto.id,
                              'codigo_barras',
                              e.target.value
                            )
                          }
                          className="border px-3 py-2 rounded-lg w-36"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setProductoEscaneandoId(producto.id)
                            setEscanerAbierto(true)
                          }}
                          className="border px-3 rounded-lg"
                          title="Escanear código"
                        >
                          📷
                        </button>
                      </div>
                    ) : (
                      producto.codigo_barras || '-'
                    )}
                  </td>

                  <td className="p-3 font-semibold">
                    {esRepositor && editandoTodo ? (
                      <input
                        value={editable?.nombre ?? ''}
                        onChange={(e) =>
                          cambiarProductoMasivo(
                            producto.id,
                            'nombre',
                            e.target.value
                          )
                        }
                        className="border px-3 py-2 rounded-lg min-w-56 w-full"
                      />
                    ) : (
                      producto.nombre
                    )}
                  </td>

                  {esRepositor && editandoTodo && (
                    <>
                      <td className="p-3">
                        <input
                          value={editable?.categoria ?? ''}
                          onChange={(e) =>
                            cambiarProductoMasivo(
                              producto.id,
                              'categoria',
                              e.target.value
                            )
                          }
                          className="border px-3 py-2 rounded-lg w-36"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          value={editable?.presentacion ?? ''}
                          onChange={(e) =>
                            cambiarProductoMasivo(
                              producto.id,
                              'presentacion',
                              e.target.value
                            )
                          }
                          className="border px-3 py-2 rounded-lg w-36"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={editable?.stock_minimo ?? '0'}
                          onChange={(e) =>
                            cambiarProductoMasivo(
                              producto.id,
                              'stock_minimo',
                              e.target.value
                            )
                          }
                          className="border px-3 py-2 rounded-lg w-24 text-center"
                        />
                      </td>
                    </>
                  )}

                  <td className="p-3 text-center">
                    $
                    {Number(
                      producto.precio_minorista
                    ).toLocaleString('es-AR')}
                  </td>

                  <td className="p-3 text-center">
                    $
                    {Number(
                      producto.precio_mayorista
                    ).toLocaleString('es-AR')}
                  </td>

                  <td className="p-3 text-center">
                    {producto.stock}
                  </td>

                  {esAdministrador && (
                    <td className="p-3 text-center">
                      <button
                        onClick={() => editarProducto(producto)}
                        className="bg-slate-100 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-slate-500">
          Mostrando {productosFiltrados.length === 0 ? 0 : inicioPagina + 1}–{Math.min(inicioPagina + porPagina, productosFiltrados.length)} de {productosFiltrados.length} productos
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))} className="border px-3 py-2 rounded-lg">
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
          <button type="button" disabled={pagina <= 1} onClick={() => setPagina((v) => Math.max(1, v - 1))} className="border px-3 py-2 rounded-lg disabled:opacity-40">Anterior</button>
          <span className="px-3 py-2 font-semibold">Página {pagina} de {totalPaginas}</span>
          <button type="button" disabled={pagina >= totalPaginas} onClick={() => setPagina((v) => Math.min(totalPaginas, v + 1))} className="border px-3 py-2 rounded-lg disabled:opacity-40">Siguiente</button>
        </div>
      </div>

      {esRepositor && editandoTodo && (
        <div className="fixed md:static bottom-0 left-0 right-0 z-40 bg-white border-t md:border md:rounded-2xl p-3 md:mt-4 shadow-2xl md:shadow-none">
          <div className="max-w-5xl mx-auto flex gap-2">
            <button
              type="button"
              onClick={cancelarEdicionMasiva}
              disabled={guardandoTodo}
              className="flex-1 border px-4 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarTodosLosProductos}
              disabled={guardandoTodo}
              className="flex-[2] bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              {guardandoTodo
                ? 'Guardando...'
                : 'Guardar todos'}
            </button>
          </div>
        </div>
      )}

      <EscanerCodigo
        abierto={escanerAbierto}
        titulo={
          productoEscaneandoId
            ? 'Cargar código del producto'
            : 'Buscar producto por código'
        }
        cerrar={() => {
          setEscanerAbierto(false)
          setProductoEscaneandoId(null)
        }}
        alDetectar={
          productoEscaneandoId
            ? escanearParaProducto
            : escanearParaBuscar
        }
      />
    </div>
  )
}

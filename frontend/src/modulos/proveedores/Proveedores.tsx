
type Props = {
  busquedaProveedor: any
  editarProveedor: any
  eliminarProveedor: any
  formularioProveedor: any
  guardarProveedor: any
  mostrarFormularioProveedor: any
  nuevoProveedor: any
  proveedorEditando: any
  proveedoresFiltrados: any
  setBusquedaProveedor: any
  setFormularioProveedor: any
  setMostrarFormularioProveedor: any
  setProveedorEditando: any
}

export default function Proveedores(p: Props) {
  return (

  <div>

    <div className="flex justify-between items-center">

      <div>

        <h3 className="text-3xl font-bold">
          Proveedores
        </h3>

        <p className="text-slate-500">
          Administrá los proveedores de la distribuidora.
        </p>

      </div>

      <button
        onClick={
          p.nuevoProveedor
        }
        className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
      >
        + Nuevo proveedor
      </button>

    </div>

    {p.mostrarFormularioProveedor && (

      <form
        onSubmit={
          p.guardarProveedor
        }
        className="bg-white border rounded-2xl p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
      >

        <div>

          <label className="font-semibold block mb-2">
            Nombre
          </label>

          <input
            required
            value={
              p.formularioProveedor.nombre
            }
            onChange={(e) =>
              p.setFormularioProveedor({
                ...p.formularioProveedor,
                nombre:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            CUIT
          </label>

          <input
            value={
              p.formularioProveedor.cuit
            }
            onChange={(e) =>
              p.setFormularioProveedor({
                ...p.formularioProveedor,
                cuit:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            Teléfono
          </label>

          <input
            value={
              p.formularioProveedor.telefono
            }
            onChange={(e) =>
              p.setFormularioProveedor({
                ...p.formularioProveedor,
                telefono:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div>

          <label className="font-semibold block mb-2">
            Email
          </label>

          <input
            type="email"
            value={
              p.formularioProveedor.email
            }
            onChange={(e) =>
              p.setFormularioProveedor({
                ...p.formularioProveedor,
                email:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div className="md:col-span-2">

          <label className="font-semibold block mb-2">
            Dirección
          </label>

          <input
            value={
              p.formularioProveedor.direccion
            }
            onChange={(e) =>
              p.setFormularioProveedor({
                ...p.formularioProveedor,
                direccion:
                  e.target.value,
              })
            }
            className="w-full border px-4 py-3 rounded-xl"
          />

        </div>

        <div className="md:col-span-2 flex gap-3">

          <button
            className="bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
            {p.proveedorEditando
              ? 'Guardar cambios'
              : 'Crear proveedor'}
          </button>

          <button
            type="button"
            onClick={() => {
              p.setMostrarFormularioProveedor(
                false
              )

              p.setProveedorEditando(
                null
              )
            }}
            className="border px-6 py-3 rounded-xl"
          >
            Cancelar
          </button>

        </div>

      </form>

    )}

    <div className="bg-white border rounded-2xl p-5 mt-6">

      <input
        value={
          p.busquedaProveedor
        }
        onChange={(e) =>
          p.setBusquedaProveedor(
            e.target.value
          )
        }
        placeholder="Buscar proveedor..."
        className="border px-4 py-3 rounded-xl w-full md:w-96"
      />

    </div>

    <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 text-left">
              Proveedor
            </th>

            <th className="p-4 text-left">
              CUIT
            </th>

            <th className="p-4 text-left">
              Teléfono
            </th>

            <th className="p-4 text-left">
              Dirección
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4">
              Acciones
            </th>

          </tr>

        </thead>

        <tbody>

          {p.proveedoresFiltrados.map(
            (proveedor: any) => (

              <tr
                key={
                  proveedor.id
                }
                className="border-t"
              >

                <td className="p-4 font-semibold">
                  {
                    proveedor.nombre
                  }
                </td>

                <td className="p-4">
                  {proveedor.cuit ||
                    '-'}
                </td>

                <td className="p-4">
                  {proveedor.telefono ||
                    '-'}
                </td>

                <td className="p-4">
                  {proveedor.direccion ||
                    '-'}
                </td>

                <td className="p-4">
                  {proveedor.email ||
                    '-'}
                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() =>
                        p.editarProveedor(
                          proveedor
                        )
                      }
                      className="bg-slate-100 px-4 py-2 rounded-lg font-semibold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        p.eliminarProveedor(
                          proveedor
                        )
                      }
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

      {p.proveedoresFiltrados.length ===
        0 && (

        <div className="p-10 text-center text-slate-500">
          No hay proveedores registrados.
        </div>

      )}

    </div>

  </div>

)
}

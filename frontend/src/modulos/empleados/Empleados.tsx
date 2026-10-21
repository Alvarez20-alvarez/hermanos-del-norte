
type Props = {
  busquedaEmpleado: any
  cambiarEstadoEmpleado: any
  editarEmpleado: any
  empleadoEditando: any
  empleadosFiltrados: any
  formularioEmpleado: any
  guardarEmpleado: any
  mostrarFormularioEmpleado: any
  nuevoEmpleado: any
  roles: any
  setBusquedaEmpleado: any
  setEmpleadoEditando: any
  setFormularioEmpleado: any
  setMostrarFormularioEmpleado: any
  usuarioLogueado: any
}

export default function Empleados(p: Props) {
  return (

            <div>

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-3xl font-bold">
                    Empleados
                  </h3>

                  <p className="text-slate-500">
                    Administrá usuarios, contraseñas y permisos.
                  </p>

                </div>

                <button
                  onClick={
                    p.nuevoEmpleado
                  }
                  className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
                >
                  + Nuevo empleado
                </button>

              </div>

              {p.mostrarFormularioEmpleado && (

                <form
                  onSubmit={
                    p.guardarEmpleado
                  }
                  className="bg-white border rounded-2xl p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <div>

                    <label className="font-semibold block mb-2">
                      Nombre completo
                    </label>

                    <input
                      required
                      value={
                        p.formularioEmpleado.nombre
                      }
                      onChange={(e) =>
                        p.setFormularioEmpleado({
                          ...p.formularioEmpleado,
                          nombre:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Usuario
                    </label>

                    <input
                      required
                      value={
                        p.formularioEmpleado.usuario
                      }
                      onChange={(e) =>
                        p.setFormularioEmpleado({
                          ...p.formularioEmpleado,
                          usuario:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Contraseña
                    </label>

                    <input
                      type="password"
                      value={
                        p.formularioEmpleado.password
                      }
                      onChange={(e) =>
                        p.setFormularioEmpleado({
                          ...p.formularioEmpleado,
                          password:
                            e.target.value,
                        })
                      }
                      placeholder={
                        p.empleadoEditando
                          ? 'Dejar vacío para mantener la actual'
                          : 'Contraseña'
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Rol
                    </label>

                    <select
                      required
                      value={
                        p.formularioEmpleado.rol_id
                      }
                      onChange={(e) =>
                        p.setFormularioEmpleado({
                          ...p.formularioEmpleado,
                          rol_id:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    >

                      <option value="">
                        Seleccionar rol
                      </option>

                      {p.roles.map(
                        (rol: any) => (

                          <option
                            key={rol.id}
                            value={rol.id}
                          >
                            {rol.nombre}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Teléfono
                    </label>

                    <input
                      value={
                        p.formularioEmpleado.telefono
                      }
                      onChange={(e) =>
                        p.setFormularioEmpleado({
                          ...p.formularioEmpleado,
                          telefono:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  {p.empleadoEditando && (

                    <div className="flex items-center">

                      <label className="flex items-center gap-3">

                        <input
                          type="checkbox"
                          checked={
                            p.formularioEmpleado.activo
                          }
                          onChange={(e) =>
                            p.setFormularioEmpleado({
                              ...p.formularioEmpleado,
                              activo:
                                e.target.checked,
                            })
                          }
                          className="w-5 h-5"
                        />

                        <span className="font-semibold">
                          Empleado activo
                        </span>

                      </label>

                    </div>

                  )}

                  <div className="md:col-span-2 flex gap-3">

                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl">
                      {p.empleadoEditando
                        ? 'Guardar cambios'
                        : 'Crear empleado'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        p.setMostrarFormularioEmpleado(
                          false
                        )
                        p.setEmpleadoEditando(
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
                    p.busquedaEmpleado
                  }
                  onChange={(e) =>
                    p.setBusquedaEmpleado(
                      e.target.value
                    )
                  }
                  placeholder="Buscar empleado..."
                  className="border px-4 py-3 rounded-xl w-full md:w-96"
                />

              </div>

              <div className="bg-white border rounded-2xl mt-5 overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-100">

                    <tr>

                      <th className="p-4 text-left">
                        Empleado
                      </th>

                      <th className="p-4 text-left">
                        Usuario
                      </th>

                      <th className="p-4 text-left">
                        Rol
                      </th>

                      <th className="p-4 text-left">
                        Teléfono
                      </th>

                      <th className="p-4 text-center">
                        Estado
                      </th>

                      <th className="p-4 text-center">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {p.empleadosFiltrados.map(
                      (empleado: any) => (

                        <tr
                          key={empleado.id}
                          className="border-t"
                        >

                          <td className="p-4 font-semibold">
                            {empleado.nombre}
                          </td>

                          <td className="p-4">
                            {empleado.usuario}
                          </td>

                          <td className="p-4">
                            {empleado.rol}
                          </td>

                          <td className="p-4">
                            {empleado.telefono ||
                              '-'}
                          </td>

                          <td className="p-4 text-center">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                empleado.activo
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {empleado.activo
                                ? 'ACTIVO'
                                : 'INACTIVO'}
                            </span>

                          </td>

                          <td className="p-4">

                            <div className="flex justify-center gap-2">

                              <button
                                onClick={() =>
                                  p.editarEmpleado(
                                    empleado
                                  )
                                }
                                className="bg-slate-100 px-4 py-2 rounded-lg font-semibold"
                              >
                                Editar
                              </button>

                              {empleado.id !==
                                p.usuarioLogueado.id && (

                                <button
                                  onClick={() =>
                                    p.cambiarEstadoEmpleado(
                                      empleado
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg font-semibold ${
                                    empleado.activo
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {empleado.activo
                                    ? 'Desactivar'
                                    : 'Activar'}
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

            </div>

          )
}


type Props = {
  configuracion: any
  guardandoConfiguracion: any
  guardarConfiguracion: any
  setConfiguracion: any
}

export default function Configuracion(p: Props) {
  return (

            <div>

              <div>

                <h3 className="text-3xl font-bold">
                  Configuración
                </h3>

                <p className="text-slate-500 mt-1">
                  Datos generales de Hermanos del Norte.
                </p>

              </div>

              <form
                onSubmit={
                  p.guardarConfiguracion
                }
                className="bg-white border rounded-2xl p-6 mt-6 max-w-4xl"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="md:col-span-2">

                    <label className="font-semibold block mb-2">
                      Nombre de la empresa
                    </label>

                    <input
                      required
                      value={
                        p.configuracion.nombre_empresa
                      }
                      onChange={(e) =>
                        p.setConfiguracion({
                          ...p.configuracion,
                          nombre_empresa:
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
                        p.configuracion.cuit
                      }
                      onChange={(e) =>
                        p.setConfiguracion({
                          ...p.configuracion,
                          cuit:
                            e.target.value,
                        })
                      }
                      placeholder="Ej: 20-12345678-9"
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Teléfono
                    </label>

                    <input
                      value={
                        p.configuracion.telefono
                      }
                      onChange={(e) =>
                        p.setConfiguracion({
                          ...p.configuracion,
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
                        p.configuracion.email
                      }
                      onChange={(e) =>
                        p.setConfiguracion({
                          ...p.configuracion,
                          email:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div>

                    <label className="font-semibold block mb-2">
                      Alias de pago
                    </label>

                    <input
                      value={
                        p.configuracion.alias_pago
                      }
                      onChange={(e) =>
                        p.setConfiguracion({
                          ...p.configuracion,
                          alias_pago:
                            e.target.value,
                        })
                      }
                      placeholder="Alias para transferencias"
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="font-semibold block mb-2">
                      Dirección
                    </label>

                    <input
                      value={
                        p.configuracion.direccion
                      }
                      onChange={(e) =>
                        p.setConfiguracion({
                          ...p.configuracion,
                          direccion:
                            e.target.value,
                        })
                      }
                      className="w-full border px-4 py-3 rounded-xl"
                    />

                  </div>

                </div>

                <div className="border-t mt-6 pt-6 flex items-center justify-between gap-4">

                  <div>

                    <p className="font-semibold">
                      Datos de la empresa
                    </p>

                    <p className="text-sm text-slate-500">
                      Más adelante estos datos se podrán usar en tickets y comprobantes.
                    </p>

                  </div>

                  <button
                    disabled={
                      p.guardandoConfiguracion
                    }
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {p.guardandoConfiguracion
                      ? 'Guardando...'
                      : 'Guardar configuración'}
                  </button>

                </div>

              </form>

            </div>

          )
}

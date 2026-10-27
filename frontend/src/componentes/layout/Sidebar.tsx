import type { Seccion } from '../../tipos'

type Props = {
  secciones: Seccion[]
  actual: Seccion
  cambiarSeccion: (seccion: Seccion) => void
  abierto: boolean
  cerrar: () => void
}

const iconos: Partial<Record<Seccion, string>> = {
  Inicio: '⌂',
  Ventas: '▣',
  Pedidos: '▤',
  Productos: '□',
  Stock: '▦',
  Clientes: '◎',
  Proveedores: '◇',
  Compras: '↓',
  Precios: '$',
  Reportes: '↗',
  Empleados: '♙',
  Configuracion: '⚙',
}

export default function Sidebar({ secciones, actual, cambiarSeccion, abierto, cerrar }: Props) {
  return (
    <>
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrar}
          className="fixed inset-0 bg-slate-950/55 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      <aside
        className={`hdn-sidebar ${abierto ? 'is-open' : 'is-collapsed'} fixed lg:sticky top-0 left-0 z-50 min-h-screen bg-gradient-to-b from-[#071a3d] via-[#0a2a66] to-[#07152f] text-white border-r border-white/5`}
      >
        <div className="hdn-sidebar-inner p-3 lg:p-3.5">
          <div className="hdn-sidebar-brand rounded-3xl border border-white/10 bg-white/[0.04] p-3.5 mb-5 overflow-hidden">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 grid place-items-center font-black text-lg shadow-lg shadow-orange-500/25 shrink-0">
                HN
              </div>

              <div className="hdn-sidebar-copy min-w-0">
                <h1 className="font-black leading-tight tracking-tight whitespace-nowrap">
                  HERMANOS<br />DEL NORTE
                </h1>
                <p className="text-[11px] text-blue-100/70 mt-1 whitespace-nowrap">Mayorista y Minorista</p>
              </div>

              <button
                type="button"
                onClick={cerrar}
                className="lg:hidden ml-auto text-2xl text-blue-100/70 hover:text-white"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>
          </div>

          <div className="hdn-sidebar-copy px-2 mb-2 text-[10px] font-bold tracking-[.18em] text-blue-200/55 uppercase whitespace-nowrap">
            Menú principal
          </div>

          <nav className="space-y-1.5">
            {secciones.map((seccion) => {
              const activo = actual === seccion

              return (
                <button
                  key={seccion}
                  type="button"
                  title={seccion}
                  onClick={() => {
                    cambiarSeccion(seccion)
                    if (window.innerWidth < 1024) cerrar()
                  }}
                  className={`hdn-sidebar-item group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-2xl text-sm font-semibold ${
                    activo
                      ? 'bg-gradient-to-r from-white to-blue-50 text-blue-950 shadow-lg shadow-blue-950/20'
                      : 'text-blue-50/90 hover:bg-cyan-400/15 hover:text-white'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl grid place-items-center text-sm shrink-0 ${
                      activo
                        ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950'
                        : 'bg-white/[0.06] text-blue-100/70 group-hover:text-white'
                    }`}
                  >
                    {iconos[seccion] || '•'}
                  </span>

                  <span className="hdn-sidebar-copy whitespace-nowrap">{seccion}</span>

                  {activo && (
                    <span className="hdn-sidebar-copy ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,.8)] shrink-0" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="hdn-sidebar-footer mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 overflow-hidden">
            <div className="hdn-sidebar-copy">
              <p className="text-xs font-semibold text-slate-300 whitespace-nowrap">Sistema de gestión</p>
              <p className="text-[11px] text-blue-200/55 mt-1 whitespace-nowrap">Hermanos del Norte · 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

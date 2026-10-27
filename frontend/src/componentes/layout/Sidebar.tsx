import type { Seccion } from '../../tipos'

type Props = {
  secciones: Seccion[]
  actual: Seccion
  cambiarSeccion: (seccion: Seccion) => void
  abierto: boolean
  cerrar: () => void
}

export default function Sidebar({ secciones, actual, cambiarSeccion, abierto, cerrar }: Props) {
  return (
    <>
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={cerrar}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-72 bg-slate-950 text-white min-h-screen p-5 transition-transform duration-200 ${
          abierto ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">HERMANOS DEL NORTE</h1>
            <p className="text-sm text-slate-400 mb-8">Mayorista y Minorista</p>
          </div>
          <button type="button" onClick={cerrar} className="lg:hidden text-2xl text-slate-300" aria-label="Cerrar menú">×</button>
        </div>

        <nav className="space-y-2">
          {secciones.map((seccion) => (
            <button
              key={seccion}
              onClick={() => {
                cambiarSeccion(seccion)
                cerrar()
              }}
              className={`w-full text-left px-4 py-3 rounded-xl ${
                actual === seccion
                  ? 'bg-white text-slate-900 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {seccion}
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}

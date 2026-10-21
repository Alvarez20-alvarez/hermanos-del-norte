import type { Seccion } from '../../tipos'

type Props = {
  secciones: Seccion[]
  actual: Seccion
  cambiarSeccion: (seccion: Seccion) => void
}

export default function Sidebar({ secciones, actual, cambiarSeccion }: Props) {
  return (
    <aside className="w-72 bg-slate-950 text-white min-h-screen p-5">
      <h1 className="text-2xl font-bold">HERMANOS DEL NORTE</h1>
      <p className="text-sm text-slate-400 mb-8">Mayorista y Minorista</p>

      <nav className="space-y-2">
        {secciones.map((seccion) => (
          <button
            key={seccion}
            onClick={() => cambiarSeccion(seccion)}
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
  )
}

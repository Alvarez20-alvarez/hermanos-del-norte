import type { Seccion, UsuarioSesion } from '../../tipos'

type Props = {
  seccion: Seccion
  usuario: UsuarioSesion
  cerrarSesion: () => void
  abrirMenu: () => void
}

export default function Header({ seccion, usuario, cerrarSesion, abrirMenu }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/92 backdrop-blur-xl border-b border-blue-100 px-4 sm:px-7 py-3.5 flex justify-between items-center gap-4 shadow-[0_6px_24px_rgba(37,99,235,0.06)]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={abrirMenu}
          className="hdn-touch-menu-button w-10 h-10 rounded-xl border border-blue-100 bg-white text-slate-700 grid place-items-center shadow-sm"
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[.18em] text-blue-500 font-black">Panel de gestión</p>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 truncate">{seccion}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-3 border border-blue-100 rounded-2xl py-2 px-3 bg-gradient-to-r from-blue-50 to-amber-50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white grid place-items-center font-black shadow-md">{usuario.nombre?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className="text-left leading-tight">
            <p className="font-bold text-sm text-slate-900">{usuario.nombre}</p>
            <p className="text-xs font-semibold text-blue-600">{usuario.rol}</p>
          </div>
        </div>
        <button onClick={cerrarSesion} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-3.5 sm:px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">Cerrar sesión</button>
      </div>
    </header>
  )
}

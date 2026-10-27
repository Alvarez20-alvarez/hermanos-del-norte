import type { Seccion, UsuarioSesion } from '../../tipos'

type Props = {
  seccion: Seccion
  usuario: UsuarioSesion
  cerrarSesion: () => void
  abrirMenu: () => void
}

export default function Header({ seccion, usuario, cerrarSesion, abrirMenu }: Props) {
  return (
    <header className="bg-white border-b px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={abrirMenu}
          className="border rounded-xl w-11 h-11 grid place-items-center text-2xl shrink-0"
          aria-label="Abrir menú"
          title="Menú"
        >
          ☰
        </button>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold truncate">{seccion}</h2>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Sistema Integral de Gestión Comercial</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="text-right hidden sm:block">
          <p className="font-semibold">{usuario.nombre}</p>
          <p className="text-sm text-slate-500">{usuario.rol}</p>
        </div>

        <button onClick={cerrarSesion} className="bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-xl">
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

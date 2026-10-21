import type { Seccion, UsuarioSesion } from '../../tipos'

type Props = {
  seccion: Seccion
  usuario: UsuarioSesion
  cerrarSesion: () => void
}

export default function Header({ seccion, usuario, cerrarSesion }: Props) {
  return (
    <header className="bg-white border-b px-8 py-5 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">{seccion}</h2>
        <p className="text-sm text-slate-500">Sistema Integral de Gestión Comercial</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="font-semibold">{usuario.nombre}</p>
          <p className="text-sm text-slate-500">{usuario.rol}</p>
        </div>

        <button
          onClick={cerrarSesion}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

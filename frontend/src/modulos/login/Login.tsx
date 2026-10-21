import type { FormEvent } from 'react'

type Props = {
  usuario: string
  setUsuario: (valor: string) => void
  password: string
  setPassword: (valor: string) => void
  mensaje: string
  iniciandoSesion: boolean
  iniciarSesion: (e: FormEvent) => void
}

export default function Login({
  usuario,
  setUsuario,
  password,
  setPassword,
  mensaje,
  iniciandoSesion,
  iniciarSesion,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            HN
          </div>
          <h1 className="text-3xl font-bold">HERMANOS DEL NORTE</h1>
          <p className="text-slate-500 mt-2">Distribuidora Mayorista y Minorista</p>
        </div>

        <form onSubmit={iniciarSesion} className="space-y-5">
          <div>
            <label className="font-semibold block mb-2">Usuario</label>
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full border px-4 py-3 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="w-full border px-4 py-3 rounded-xl"
            />
          </div>

          {mensaje && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl">{mensaje}</div>
          )}

          <button
            disabled={iniciandoSesion}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {iniciandoSesion ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Acceso exclusivo para personal autorizado
        </div>
      </div>
    </div>
  )
}

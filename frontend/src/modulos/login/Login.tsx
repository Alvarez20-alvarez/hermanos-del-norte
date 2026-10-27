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

export default function Login({ usuario, setUsuario, password, setPassword, mensaje, iniciandoSesion, iniciarSesion }: Props) {
  return (
    <div className="min-h-screen bg-[#07101d] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="w-full max-w-[980px] grid lg:grid-cols-[1.05fr_.95fr] bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30 relative z-10">
        <div className="hidden lg:flex bg-slate-950 text-white p-12 flex-col justify-between min-h-[610px]">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 grid place-items-center text-xl font-black mb-8">HN</div>
            <p className="text-amber-300 font-bold text-xs tracking-[.2em] uppercase">Sistema comercial</p>
            <h1 className="text-5xl font-black tracking-tight leading-[.95] mt-3">HERMANOS<br/>DEL NORTE</h1>
            <p className="text-slate-400 mt-5 max-w-sm leading-relaxed">Gestión de ventas, stock, clientes, pedidos y caja en un solo lugar.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {['Ventas', 'Stock', 'Caja'].map((item) => <div key={item} className="border border-white/10 rounded-2xl p-3 text-slate-300 bg-white/[0.03]">{item}</div>)}
          </div>
        </div>

        <div className="p-7 sm:p-10 lg:p-12 flex items-center">
          <div className="w-full">
            <div className="lg:hidden w-14 h-14 bg-slate-950 text-white rounded-2xl grid place-items-center mx-auto mb-5 text-xl font-black">HN</div>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-600">Acceso al sistema</p>
              <h2 className="text-3xl font-black tracking-tight mt-2 text-slate-950">Bienvenido</h2>
              <p className="text-slate-500 mt-2">Ingresá con tu usuario y contraseña para continuar.</p>
            </div>

            <form onSubmit={iniciarSesion} className="space-y-5">
              <div>
                <label className="font-bold text-sm block mb-2 text-slate-700">Usuario</label>
                <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ingrese su usuario" className="w-full border border-slate-200 px-4 py-3.5 rounded-2xl bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="font-bold text-sm block mb-2 text-slate-700">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" className="w-full border border-slate-200 px-4 py-3.5 rounded-2xl bg-slate-50 focus:bg-white" />
              </div>
              {mensaje && <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-2xl text-sm font-medium">{mensaje}</div>}
              <button disabled={iniciandoSesion} className="w-full bg-slate-950 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-900/10 disabled:opacity-50">{iniciandoSesion ? 'Ingresando...' : 'Iniciar sesión'}</button>
            </form>
            <div className="mt-7 pt-5 border-t text-center text-xs text-slate-400">Acceso exclusivo para personal autorizado</div>
          </div>
        </div>
      </div>
    </div>
  )
}

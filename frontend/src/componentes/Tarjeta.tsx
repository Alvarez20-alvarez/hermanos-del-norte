type Props = {
  titulo: string
  valor: number
}

export default function Tarjeta({ titulo, valor }: Props) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <p className="text-slate-500">{titulo}</p>
      <p className="text-3xl font-bold mt-1">{valor}</p>
    </div>
  )
}

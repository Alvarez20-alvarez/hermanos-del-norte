import { useEffect, useRef, useState } from 'react'

type Props = {
  abierto: boolean
  titulo?: string
  alDetectar: (codigo: string) => void
  cerrar: () => void
}

export default function EscanerCodigo({
  abierto,
  titulo = 'Escanear código de barras',
  alDetectar,
  cerrar,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervaloRef = useRef<number | null>(null)

  const [mensaje, setMensaje] = useState('')
  const [codigoManual, setCodigoManual] = useState('')
  const [iniciando, setIniciando] = useState(false)

  const detenerCamara = () => {
    if (intervaloRef.current !== null) {
      window.clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const confirmarCodigo = (codigo: string) => {
    const limpio = codigo.trim()
    if (!limpio) return

    detenerCamara()
    alDetectar(limpio)
    cerrar()
  }

  useEffect(() => {
    if (!abierto) {
      detenerCamara()
      setMensaje('')
      setCodigoManual('')
      return
    }

    let cancelado = false

    const iniciar = async () => {
      try {
        setIniciando(true)
        setMensaje('Abriendo cámara...')

        if (!navigator.mediaDevices?.getUserMedia) {
          setMensaje(
            'Este navegador no permite usar la cámara desde aquí. Podés escribir el código manualmente.'
          )
          return
        }

        const BarcodeDetectorClass = (window as any).BarcodeDetector

        if (!BarcodeDetectorClass) {
          setMensaje(
            'La lectura automática no está disponible en este navegador. Podés escribir el código manualmente.'
          )
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
          audio: false,
        })

        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (!videoRef.current) return

        videoRef.current.srcObject = stream
        await videoRef.current.play()

        const detector = new BarcodeDetectorClass({
          formats: [
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'code_128',
            'code_39',
            'itf',
            'codabar',
          ],
        })

        setMensaje('Apuntá la cámara al código de barras.')

        intervaloRef.current = window.setInterval(async () => {
          if (!videoRef.current) return

          try {
            const codigos = await detector.detect(videoRef.current)

            if (codigos?.length > 0) {
              const valor =
                codigos[0].rawValue ||
                codigos[0].rawData ||
                ''

              if (valor) {
                confirmarCodigo(String(valor))
              }
            }
          } catch {
            // Ignoramos cuadros donde todavía no se pudo leer el código.
          }
        }, 350)
      } catch {
        setMensaje(
          'No se pudo abrir la cámara. Revisá el permiso del navegador o escribí el código manualmente.'
        )
      } finally {
        setIniciando(false)
      }
    }

    iniciar()

    return () => {
      cancelado = true
      detenerCamara()
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3 p-4 border-b">
          <div>
            <h3 className="text-lg font-bold">{titulo}</h3>
            <p className="text-sm text-slate-500">
              Usá la cámara trasera del celular.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="border px-4 py-2 rounded-xl font-semibold"
          >
            Cerrar
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden min-h-64 flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full max-h-[55vh] object-cover"
              playsInline
              muted
            />

            {iniciando && (
              <div className="absolute text-white font-semibold">
                Abriendo cámara...
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600">{mensaje}</p>

          <div className="border-t pt-4">
            <label className="font-semibold block mb-2">
              O escribir código manualmente
            </label>

            <div className="flex gap-2">
              <input
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value)}
                inputMode="numeric"
                autoFocus={false}
                placeholder="Código de barras"
                className="flex-1 min-w-0 border px-4 py-3 rounded-xl"
              />

              <button
                type="button"
                onClick={() => confirmarCodigo(codigoManual)}
                disabled={!codigoManual.trim()}
                className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-40"
              >
                Usar
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Para usar la cámara desde un celular, el sistema debe abrirse mediante
            una conexión segura (HTTPS) o un entorno compatible.
          </p>
        </div>
      </div>
    </div>
  )
}

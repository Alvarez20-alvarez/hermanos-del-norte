import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

const obtenerCajaConResumen = async (cajaId: number) => {
  const [filas]: any = await db.query(
    `
    SELECT
      c.id,
      c.empleado_id,
      c.usuario,
      c.monto_inicial,
      c.monto_contado,
      c.monto_esperado,
      c.diferencia,
      c.estado,
      c.abierta_en,
      c.cerrada_en,
      COALESCE(SUM(
        CASE
          WHEN mc.tipo IN ('VENTA', 'INGRESO') THEN mc.monto
          WHEN mc.tipo = 'EGRESO' THEN -mc.monto
          ELSE 0
        END
      ), 0) AS movimientos_efectivo,
      COALESCE(SUM(CASE WHEN mc.tipo = 'VENTA' THEN mc.monto ELSE 0 END), 0) AS ventas_efectivo
    FROM cajas c
    LEFT JOIN movimientos_caja mc ON mc.caja_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
    `,
    [cajaId]
  )

  if (filas.length === 0) return null

  const caja = filas[0]
  const montoInicial = Number(caja.monto_inicial || 0)
  const movimientos = Number(caja.movimientos_efectivo || 0)

  return {
    ...caja,
    monto_inicial: montoInicial,
    ventas_efectivo: Number(caja.ventas_efectivo || 0),
    movimientos_efectivo: movimientos,
    esperado_actual: montoInicial + movimientos,
    monto_contado: caja.monto_contado == null ? null : Number(caja.monto_contado),
    monto_esperado: caja.monto_esperado == null ? null : Number(caja.monto_esperado),
    diferencia: caja.diferencia == null ? null : Number(caja.diferencia),
  }
}

router.get('/api/caja/abierta/:empleadoId', async (req, res) => {
  try {
    const empleadoId = Number(req.params.empleadoId)

    if (!empleadoId) {
      return res.status(400).json({ mensaje: 'Empleado inválido' })
    }

    const [filas]: any = await db.query(
      `
      SELECT id
      FROM cajas
      WHERE empleado_id = ? AND estado = 'ABIERTA'
      ORDER BY abierta_en DESC
      LIMIT 1
      `,
      [empleadoId]
    )

    if (filas.length === 0) {
      return res.json({ caja: null })
    }

    const caja = await obtenerCajaConResumen(Number(filas[0].id))
    return res.json({ caja })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensaje: 'No se pudo consultar la caja' })
  }
})

router.post('/api/caja/abrir', async (req, res) => {
  try {
    const empleadoId = Number(req.body.empleado_id)
    const usuario = String(req.body.usuario || '').trim()
    const montoInicial = Number(req.body.monto_inicial)

    if (!empleadoId || !usuario) {
      return res.status(400).json({ mensaje: 'Faltan datos del cajero' })
    }

    if (Number.isNaN(montoInicial) || montoInicial < 0) {
      return res.status(400).json({ mensaje: 'El monto inicial no es válido' })
    }

    const [abiertas]: any = await db.query(
      `SELECT id FROM cajas WHERE empleado_id = ? AND estado = 'ABIERTA' LIMIT 1`,
      [empleadoId]
    )

    if (abiertas.length > 0) {
      const caja = await obtenerCajaConResumen(Number(abiertas[0].id))
      return res.status(409).json({
        mensaje: 'Este usuario ya tiene una caja abierta',
        caja,
      })
    }

    const [resultado]: any = await db.query(
      `
      INSERT INTO cajas (empleado_id, usuario, monto_inicial, estado)
      VALUES (?, ?, ?, 'ABIERTA')
      `,
      [empleadoId, usuario, montoInicial]
    )

    const caja = await obtenerCajaConResumen(Number(resultado.insertId))
    return res.status(201).json({ mensaje: 'Caja abierta correctamente', caja })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensaje: 'No se pudo abrir la caja' })
  }
})

router.post('/api/caja/:id/cerrar', async (req, res) => {
  const conexion = await db.getConnection()

  try {
    const cajaId = Number(req.params.id)
    const montoContado = Number(req.body.monto_contado)

    if (!cajaId) {
      return res.status(400).json({ mensaje: 'Caja inválida' })
    }

    if (Number.isNaN(montoContado) || montoContado < 0) {
      return res.status(400).json({ mensaje: 'El efectivo contado no es válido' })
    }

    await conexion.beginTransaction()

    const [cajas]: any = await conexion.query(
      `SELECT * FROM cajas WHERE id = ? FOR UPDATE`,
      [cajaId]
    )

    if (cajas.length === 0) {
      await conexion.rollback()
      return res.status(404).json({ mensaje: 'Caja no encontrada' })
    }

    const caja = cajas[0]

    if (caja.estado !== 'ABIERTA') {
      await conexion.rollback()
      return res.status(400).json({ mensaje: 'La caja ya está cerrada' })
    }

    const [movimientos]: any = await conexion.query(
      `
      SELECT COALESCE(SUM(
        CASE
          WHEN tipo IN ('VENTA', 'INGRESO') THEN monto
          WHEN tipo = 'EGRESO' THEN -monto
          ELSE 0
        END
      ), 0) AS total
      FROM movimientos_caja
      WHERE caja_id = ?
      `,
      [cajaId]
    )

    const montoEsperado = Number(caja.monto_inicial || 0) + Number(movimientos[0]?.total || 0)
    const diferencia = montoContado - montoEsperado

    await conexion.query(
      `
      UPDATE cajas
      SET
        monto_esperado = ?,
        monto_contado = ?,
        diferencia = ?,
        estado = 'CERRADA',
        cerrada_en = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [montoEsperado, montoContado, diferencia, cajaId]
    )

    await conexion.commit()

    const cajaCerrada = await obtenerCajaConResumen(cajaId)
    return res.json({ mensaje: 'Caja cerrada correctamente', caja: cajaCerrada })
  } catch (error) {
    await conexion.rollback()
    console.error(error)
    return res.status(500).json({ mensaje: 'No se pudo cerrar la caja' })
  } finally {
    conexion.release()
  }
})

router.get('/api/caja/:id', async (req, res) => {
  try {
    const cajaId = Number(req.params.id)
    const caja = await obtenerCajaConResumen(cajaId)

    if (!caja) {
      return res.status(404).json({ mensaje: 'Caja no encontrada' })
    }

    return res.json({ caja })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensaje: 'No se pudo consultar la caja' })
  }
})

export default router

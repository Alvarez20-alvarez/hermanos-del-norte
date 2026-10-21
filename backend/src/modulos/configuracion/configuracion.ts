import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// CONFIGURACION
// =====================================================

// Obtener configuración
router.get('/api/configuracion', async (_req, res) => {
  try {
    const [filas]: any = await db.query(`
      SELECT
        id,
        nombre_empresa,
        cuit,
        direccion,
        telefono,
        email,
        alias_pago,
        updated_at
      FROM configuracion
      WHERE id = 1
      LIMIT 1
    `)

    if (filas.length === 0) {
      return res.json({
        nombre_empresa:
          'HERMANOS DEL NORTE',
        cuit: '',
        direccion: '',
        telefono: '',
        email: '',
        alias_pago: '',
      })
    }

    res.json(filas[0])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener la configuración',
    })
  }
})

// Guardar configuración
router.put('/api/configuracion', async (req, res) => {
  try {
    const {
      nombre_empresa,
      cuit,
      direccion,
      telefono,
      email,
      alias_pago,
    } = req.body

    if (!nombre_empresa) {
      return res.status(400).json({
        mensaje:
          'El nombre de la empresa es obligatorio',
      })
    }

    await db.query(
      `
      INSERT INTO configuracion
      (
        id,
        nombre_empresa,
        cuit,
        direccion,
        telefono,
        email,
        alias_pago
      )
      VALUES
      (
        1, ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        nombre_empresa = VALUES(nombre_empresa),
        cuit = VALUES(cuit),
        direccion = VALUES(direccion),
        telefono = VALUES(telefono),
        email = VALUES(email),
        alias_pago = VALUES(alias_pago)
      `,
      [
        nombre_empresa,
        cuit || '',
        direccion || '',
        telefono || '',
        email || '',
        alias_pago || '',
      ]
    )

    res.json({
      mensaje:
        'Configuración guardada correctamente',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al guardar la configuración',
    })
  }
})



export default router

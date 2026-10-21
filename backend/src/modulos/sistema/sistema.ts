import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// API PRINCIPAL
// =====================================================

router.get('/api', async (_req, res) => {
  res.json({
    mensaje: 'API de HERMANOS DEL NORTE funcionando',
  })
})

// =====================================================
// PRUEBA MYSQL
// =====================================================

router.get('/api/test-db', async (_req, res) => {
  try {
    const [resultado] = await db.query(
      'SELECT 1 AS conexion'
    )

    res.json({
      mensaje: 'Conexión con MySQL correcta',
      resultado,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: 'No se pudo conectar con MySQL',
    })
  }
})


export default router

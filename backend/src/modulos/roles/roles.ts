import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// ROLES
// =====================================================

router.get('/api/roles', async (_req, res) => {
  try {
    const [roles] = await db.query(`
      SELECT
        id,
        nombre,
        descripcion
      FROM roles
      ORDER BY id
    `)

    res.json(roles)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: 'Error al obtener los roles',
    })
  }
})


export default router

import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// CLIENTES
// =====================================================

// Obtener clientes
router.get('/api/clientes', async (_req, res) => {
  try {
    const [clientes] =
      await db.query(`
        SELECT *
        FROM clientes
        WHERE activo = TRUE
        ORDER BY nombre
      `)

    res.json(clientes)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener clientes',
    })
  }
})

// Crear cliente
router.post('/api/clientes', async (req, res) => {
  try {
    const {
      nombre,
      dni_cuit,
      telefono,
      direccion,
      tipo_cliente,
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        mensaje:
          'El nombre del cliente es obligatorio',
      })
    }

    const [resultado]: any =
      await db.query(
        `
        INSERT INTO clientes
        (
          nombre,
          dni_cuit,
          telefono,
          direccion,
          tipo_cliente
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          nombre,
          dni_cuit || '',
          telefono || '',
          direccion || '',
          tipo_cliente ===
          'MAYORISTA'
            ? 'MAYORISTA'
            : 'MINORISTA',
        ]
      )

    res.status(201).json({
      mensaje:
        'Cliente creado correctamente',
      cliente_id:
        resultado.insertId,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al crear cliente',
    })
  }
})

// Editar cliente
router.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } =
      req.params

    const {
      nombre,
      dni_cuit,
      telefono,
      direccion,
      tipo_cliente,
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        mensaje:
          'El nombre del cliente es obligatorio',
      })
    }

    const [resultado]: any =
      await db.query(
        `
        UPDATE clientes
        SET
          nombre = ?,
          dni_cuit = ?,
          telefono = ?,
          direccion = ?,
          tipo_cliente = ?
        WHERE id = ?
        `,
        [
          nombre,
          dni_cuit || '',
          telefono || '',
          direccion || '',
          tipo_cliente ===
          'MAYORISTA'
            ? 'MAYORISTA'
            : 'MINORISTA',
          id,
        ]
      )

    if (
      resultado.affectedRows === 0
    ) {
      return res.status(404).json({
        mensaje:
          'Cliente no encontrado',
      })
    }

    res.json({
      mensaje:
        'Cliente actualizado correctamente',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al actualizar cliente',
    })
  }
})

// Eliminar/desactivar cliente
router.delete(
  '/api/clientes/:id',
  async (req, res) => {
    try {
      const { id } =
        req.params

      const [resultado]: any =
        await db.query(
          `
          UPDATE clientes
          SET activo = FALSE
          WHERE id = ?
          `,
          [id]
        )

      if (
        resultado.affectedRows === 0
      ) {
        return res.status(404).json({
          mensaje:
            'Cliente no encontrado',
        })
      }

      res.json({
        mensaje:
          'Cliente eliminado correctamente',
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al eliminar cliente',
      })
    }
  }
)


export default router

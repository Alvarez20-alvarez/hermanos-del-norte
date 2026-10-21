import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// PROVEEDORES
// =====================================================

// Obtener proveedores
router.get('/api/proveedores', async (_req, res) => {
  try {
    const [proveedores] =
      await db.query(`
        SELECT
          id,
          nombre,
          cuit,
          telefono,
          direccion,
          email,
          activo,
          created_at,
          updated_at
        FROM proveedores
        WHERE activo = TRUE
        ORDER BY nombre
      `)

    res.json(proveedores)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener proveedores',
    })
  }
})

// Crear proveedor
router.post('/api/proveedores', async (req, res) => {
  try {
    const {
      nombre,
      cuit,
      telefono,
      direccion,
      email,
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        mensaje:
          'El nombre del proveedor es obligatorio',
      })
    }

    const [resultado]: any =
      await db.query(
        `
        INSERT INTO proveedores
        (
          nombre,
          cuit,
          telefono,
          direccion,
          email
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          nombre,
          cuit || '',
          telefono || '',
          direccion || '',
          email || '',
        ]
      )

    res.status(201).json({
      mensaje:
        'Proveedor creado correctamente',

      proveedor_id:
        resultado.insertId,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al crear proveedor',
    })
  }
})

// Editar proveedor
router.put(
  '/api/proveedores/:id',
  async (req, res) => {
    try {
      const { id } =
        req.params

      const {
        nombre,
        cuit,
        telefono,
        direccion,
        email,
      } = req.body

      if (!nombre) {
        return res.status(400).json({
          mensaje:
            'El nombre del proveedor es obligatorio',
        })
      }

      const [resultado]: any =
        await db.query(
          `
          UPDATE proveedores
          SET
            nombre = ?,
            cuit = ?,
            telefono = ?,
            direccion = ?,
            email = ?
          WHERE id = ?
          `,
          [
            nombre,
            cuit || '',
            telefono || '',
            direccion || '',
            email || '',
            id,
          ]
        )

      if (
        resultado.affectedRows === 0
      ) {
        return res.status(404).json({
          mensaje:
            'Proveedor no encontrado',
        })
      }

      res.json({
        mensaje:
          'Proveedor actualizado correctamente',
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al actualizar proveedor',
      })
    }
  }
)

// Desactivar proveedor
router.delete(
  '/api/proveedores/:id',
  async (req, res) => {
    try {
      const { id } =
        req.params

      const [resultado]: any =
        await db.query(
          `
          UPDATE proveedores
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
            'Proveedor no encontrado',
        })
      }

      res.json({
        mensaje:
          'Proveedor eliminado correctamente',
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al eliminar proveedor',
      })
    }
  }
)


export default router

import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// PRODUCTOS
// =====================================================

// Obtener productos
router.get('/api/productos', async (_req, res) => {
  try {
    const [filas] = await db.query(`
      SELECT *
      FROM productos
      WHERE activo = TRUE
      ORDER BY nombre
    `)

    res.json(filas)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener productos',
    })
  }
})

// Buscar producto por código
router.get(
  '/api/productos/codigo/:codigo',
  async (req, res) => {
    try {
      const { codigo } =
        req.params

      const [filas]: any =
        await db.query(
          `
          SELECT *
          FROM productos
          WHERE codigo_barras = ?
          AND activo = TRUE
          LIMIT 1
          `,
          [codigo]
        )

      if (filas.length === 0) {
        return res.status(404).json({
          mensaje:
            'Producto no encontrado',
        })
      }

      res.json(filas[0])
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al buscar producto',
      })
    }
  }
)

// Crear producto
router.post('/api/productos', async (req, res) => {
  try {
    const {
      codigo_barras,
      nombre,
      categoria,
      presentacion,
      precio_compra,
      precio_minorista,
      precio_mayorista,
      cantidad_min_mayorista,
      stock,
      stock_minimo,
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        mensaje:
          'El nombre es obligatorio',
      })
    }

    const [resultado]: any =
      await db.query(
        `
        INSERT INTO productos
        (
          codigo_barras,
          nombre,
          categoria,
          presentacion,
          precio_compra,
          precio_minorista,
          precio_mayorista,
          cantidad_min_mayorista,
          stock,
          stock_minimo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          codigo_barras || null,
          nombre,
          categoria || '',
          presentacion || '',
          Number(precio_compra) || 0,
          Number(precio_minorista) || 0,
          Number(precio_mayorista) || 0,
          Number(cantidad_min_mayorista) || 1,
          Number(stock) || 0,
          Number(stock_minimo) || 0,
        ]
      )

    res.status(201).json({
      mensaje:
        'Producto creado correctamente',
      producto_id:
        resultado.insertId,
    })
  } catch (error: any) {
    console.error(error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensaje:
          'Código de barras duplicado',
      })
    }

    res.status(500).json({
      mensaje:
        'Error al crear producto',
    })
  }
})

// Editar producto
router.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } =
      req.params

    const {
      codigo_barras,
      nombre,
      categoria,
      presentacion,
      precio_compra,
      precio_minorista,
      precio_mayorista,
      cantidad_min_mayorista,
      stock,
      stock_minimo,
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        mensaje:
          'El nombre es obligatorio',
      })
    }

    const [resultado]: any =
      await db.query(
        `
        UPDATE productos
        SET
          codigo_barras = ?,
          nombre = ?,
          categoria = ?,
          presentacion = ?,
          precio_compra = ?,
          precio_minorista = ?,
          precio_mayorista = ?,
          cantidad_min_mayorista = ?,
          stock = ?,
          stock_minimo = ?
        WHERE id = ?
        `,
        [
          codigo_barras || null,
          nombre,
          categoria || '',
          presentacion || '',
          Number(precio_compra) || 0,
          Number(precio_minorista) || 0,
          Number(precio_mayorista) || 0,
          Number(cantidad_min_mayorista) || 1,
          Number(stock) || 0,
          Number(stock_minimo) || 0,
          id,
        ]
      )

    if (
      resultado.affectedRows === 0
    ) {
      return res.status(404).json({
        mensaje:
          'Producto no encontrado',
      })
    }

    res.json({
      mensaje:
        'Producto actualizado correctamente',
    })
  } catch (error: any) {
    console.error(error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensaje:
          'Ese código de barras ya pertenece a otro producto',
      })
    }

    res.status(500).json({
      mensaje:
        'Error al actualizar producto',
    })
  }
})


export default router

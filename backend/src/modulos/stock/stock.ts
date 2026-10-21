import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// STOCK
// =====================================================

// Historial
router.get(
  '/api/movimientos-stock',
  async (_req, res) => {
    try {
      const [filas] =
        await db.query(`
          SELECT
            movimientos_stock.id,
            movimientos_stock.producto_id,
            productos.nombre AS producto,
            productos.codigo_barras,
            movimientos_stock.tipo,
            movimientos_stock.cantidad,
            movimientos_stock.stock_anterior,
            movimientos_stock.stock_nuevo,
            movimientos_stock.motivo,
            movimientos_stock.fecha
          FROM movimientos_stock
          INNER JOIN productos
            ON productos.id =
               movimientos_stock.producto_id
          ORDER BY movimientos_stock.fecha DESC
        `)

      res.json(filas)
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al obtener movimientos',
      })
    }
  }
)

// Movimiento manual
router.post(
  '/api/stock/movimiento',
  async (req, res) => {
    const conexion =
      await db.getConnection()

    try {
      const {
        producto_id,
        tipo,
        cantidad,
        motivo,
      } = req.body

      if (!producto_id) {
        return res.status(400).json({
          mensaje:
            'Debe seleccionar un producto',
        })
      }

      if (
        ![
          'ENTRADA',
          'SALIDA',
          'AJUSTE',
        ].includes(tipo)
      ) {
        return res.status(400).json({
          mensaje:
            'Tipo de movimiento inválido',
        })
      }

      const cantidadNumero =
        Number(cantidad)

      if (
        Number.isNaN(cantidadNumero) ||
        cantidadNumero < 0
      ) {
        return res.status(400).json({
          mensaje:
            'Cantidad inválida',
        })
      }

      await conexion.beginTransaction()

      const [productos]: any =
        await conexion.query(
          `
          SELECT
            id,
            nombre,
            stock
          FROM productos
          WHERE id = ?
          FOR UPDATE
          `,
          [producto_id]
        )

      if (
        productos.length === 0
      ) {
        await conexion.rollback()

        return res.status(404).json({
          mensaje:
            'Producto no encontrado',
        })
      }

      const producto =
        productos[0]

      const stockAnterior =
        Number(producto.stock)

      let stockNuevo =
        stockAnterior

      let cantidadMovimiento =
        cantidadNumero

      if (tipo === 'ENTRADA') {
        if (cantidadNumero <= 0) {
          await conexion.rollback()

          return res.status(400).json({
            mensaje:
              'La entrada debe ser mayor a 0',
          })
        }

        stockNuevo =
          stockAnterior +
          cantidadNumero
      }

      if (tipo === 'SALIDA') {
        if (cantidadNumero <= 0) {
          await conexion.rollback()

          return res.status(400).json({
            mensaje:
              'La salida debe ser mayor a 0',
          })
        }

        if (
          cantidadNumero >
          stockAnterior
        ) {
          await conexion.rollback()

          return res.status(400).json({
            mensaje:
              `Stock insuficiente. Disponible: ${stockAnterior}`,
          })
        }

        stockNuevo =
          stockAnterior -
          cantidadNumero
      }

      if (tipo === 'AJUSTE') {
        stockNuevo =
          cantidadNumero

        cantidadMovimiento =
          Math.abs(
            stockNuevo -
            stockAnterior
          )
      }

      await conexion.query(
        `
        UPDATE productos
        SET stock = ?
        WHERE id = ?
        `,
        [
          stockNuevo,
          producto_id,
        ]
      )

      await conexion.query(
        `
        INSERT INTO movimientos_stock
        (
          producto_id,
          tipo,
          cantidad,
          stock_anterior,
          stock_nuevo,
          motivo
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          producto_id,
          tipo,
          cantidadMovimiento,
          stockAnterior,
          stockNuevo,
          motivo || '',
        ]
      )

      await conexion.commit()

      res.status(201).json({
        mensaje:
          'Movimiento registrado correctamente',

        stock_anterior:
          stockAnterior,

        stock_nuevo:
          stockNuevo,
      })
    } catch (error) {
      await conexion.rollback()

      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al registrar movimiento',
      })
    } finally {
      conexion.release()
    }
  }
)


export default router

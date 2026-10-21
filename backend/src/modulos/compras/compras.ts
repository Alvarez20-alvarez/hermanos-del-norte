import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// COMPRAS
// =====================================================

// Registrar compra
router.post('/api/compras', async (req, res) => {
  const conexion =
    await db.getConnection()

  try {
    const {
      proveedor_id,
      usuario,
      observacion,
      productos,
    } = req.body

    if (!usuario) {
      return res.status(400).json({
        mensaje:
          'La compra debe tener un usuario',
      })
    }

    if (
      !productos ||
      !Array.isArray(productos) ||
      productos.length === 0
    ) {
      return res.status(400).json({
        mensaje:
          'La compra debe tener al menos un producto',
      })
    }

    await conexion.beginTransaction()

    let proveedorId:
      | number
      | null = null

    if (proveedor_id) {
      const [proveedores]: any =
        await conexion.query(
          `
          SELECT id
          FROM proveedores
          WHERE id = ?
          AND activo = TRUE
          `,
          [proveedor_id]
        )

      if (
        proveedores.length === 0
      ) {
        await conexion.rollback()

        return res.status(400).json({
          mensaje:
            'El proveedor seleccionado no existe',
        })
      }

      proveedorId =
        Number(
          proveedor_id
        )
    }

    let totalCompra = 0

    const detallePreparado:
      any[] = []

    for (
      const item
      of productos
    ) {
      const productoId =
        Number(
          item.producto_id
        )

      const cantidad =
        Number(
          item.cantidad
        )

      const precioCompra =
        Number(
          item.precio_compra
        )

      if (!productoId) {
        throw new Error(
          'Producto inválido'
        )
      }

      if (
        Number.isNaN(cantidad) ||
        cantidad <= 0
      ) {
        throw new Error(
          'La cantidad debe ser mayor a 0'
        )
      }

      if (
        Number.isNaN(precioCompra) ||
        precioCompra < 0
      ) {
        throw new Error(
          'El precio de compra no es válido'
        )
      }

      const [filas]: any =
        await conexion.query(
          `
          SELECT
            id,
            nombre,
            stock
          FROM productos
          WHERE id = ?
          AND activo = TRUE
          FOR UPDATE
          `,
          [productoId]
        )

      if (
        filas.length === 0
      ) {
        throw new Error(
          'Uno de los productos no existe'
        )
      }

      const producto =
        filas[0]

      const stockAnterior =
        Number(
          producto.stock
        )

      const stockNuevo =
        stockAnterior +
        cantidad

      const subtotal =
        cantidad *
        precioCompra

      totalCompra +=
        subtotal

      detallePreparado.push({
        producto_id:
          productoId,

        nombre:
          producto.nombre,

        cantidad,

        precio_compra:
          precioCompra,

        subtotal,

        stock_anterior:
          stockAnterior,

        stock_nuevo:
          stockNuevo,
      })
    }

    const [compraResultado]: any =
      await conexion.query(
        `
        INSERT INTO compras
        (
          proveedor_id,
          usuario,
          total,
          observacion
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          proveedorId,
          usuario,
          totalCompra,
          observacion || '',
        ]
      )

    const compraId =
      compraResultado.insertId

    for (
      const item
      of detallePreparado
    ) {
      await conexion.query(
        `
        INSERT INTO detalle_compras
        (
          compra_id,
          producto_id,
          cantidad,
          precio_compra,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          compraId,
          item.producto_id,
          item.cantidad,
          item.precio_compra,
          item.subtotal,
        ]
      )

      await conexion.query(
        `
        UPDATE productos
        SET
          stock = ?,
          precio_compra = ?
        WHERE id = ?
        `,
        [
          item.stock_nuevo,
          item.precio_compra,
          item.producto_id,
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
        VALUES (?, 'ENTRADA', ?, ?, ?, ?)
        `,
        [
          item.producto_id,
          item.cantidad,
          item.stock_anterior,
          item.stock_nuevo,
          `Compra #${compraId}`,
        ]
      )
    }

    await conexion.commit()

    res.status(201).json({
      mensaje:
        'Compra registrada correctamente',

      compra_id:
        compraId,

      total:
        totalCompra,
    })
  } catch (error: any) {
    await conexion.rollback()

    console.error(error)

    res.status(400).json({
      mensaje:
        error.message ||
        'Error al registrar la compra',
    })
  } finally {
    conexion.release()
  }
})

// Historial de compras
router.get('/api/compras', async (_req, res) => {
  try {
    const [compras] =
      await db.query(`
        SELECT
          compras.id,
          compras.proveedor_id,
          proveedores.nombre AS proveedor,
          compras.usuario,
          compras.total,
          compras.observacion,
          compras.fecha
        FROM compras
        LEFT JOIN proveedores
          ON proveedores.id =
             compras.proveedor_id
        ORDER BY compras.fecha DESC
      `)

    res.json(compras)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener compras',
    })
  }
})

// Detalle compra
router.get(
  '/api/compras/:id',
  async (req, res) => {
    try {
      const { id } =
        req.params

      const [compras]: any =
        await db.query(
          `
          SELECT
            compras.id,
            compras.proveedor_id,
            proveedores.nombre AS proveedor,
            compras.usuario,
            compras.total,
            compras.observacion,
            compras.fecha
          FROM compras
          LEFT JOIN proveedores
            ON proveedores.id =
               compras.proveedor_id
          WHERE compras.id = ?
          `,
          [id]
        )

      if (
        compras.length === 0
      ) {
        return res.status(404).json({
          mensaje:
            'Compra no encontrada',
        })
      }

      const [detalle] =
        await db.query(
          `
          SELECT
            detalle_compras.id,
            detalle_compras.producto_id,
            productos.nombre AS producto,
            productos.codigo_barras,
            detalle_compras.cantidad,
            detalle_compras.precio_compra,
            detalle_compras.subtotal
          FROM detalle_compras
          INNER JOIN productos
            ON productos.id =
               detalle_compras.producto_id
          WHERE detalle_compras.compra_id = ?
          `,
          [id]
        )

      res.json({
        compra:
          compras[0],

        detalle,
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al obtener el detalle de la compra',
      })
    }
  }
)


export default router

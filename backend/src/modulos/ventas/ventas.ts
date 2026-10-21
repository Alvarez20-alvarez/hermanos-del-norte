import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// VENTAS
// =====================================================

// Crear venta
router.post('/api/ventas', async (req, res) => {
  const conexion =
    await db.getConnection()

  try {
    const {
      usuario,
      cliente_id,
      tipo_venta,
      forma_pago,
      descuento,
      productos,
    } = req.body

    if (
      !productos ||
      !Array.isArray(productos) ||
      productos.length === 0
    ) {
      return res.status(400).json({
        mensaje:
          'La venta debe tener productos',
      })
    }

    const tipoVenta =
      tipo_venta === 'MAYORISTA'
        ? 'MAYORISTA'
        : 'MINORISTA'

    const formasPago = [
      'EFECTIVO',
      'TRANSFERENCIA',
      'DEBITO',
      'CREDITO',
      'OTRO',
    ]

    const formaPago =
      formasPago.includes(
        forma_pago
      )
        ? forma_pago
        : 'EFECTIVO'

    await conexion.beginTransaction()

    // Validar cliente
    let clienteId:
      | number
      | null = null

    if (cliente_id) {
      const [clientes]: any =
        await conexion.query(
          `
          SELECT id
          FROM clientes
          WHERE id = ?
          AND activo = TRUE
          `,
          [cliente_id]
        )

      if (
        clientes.length === 0
      ) {
        await conexion.rollback()

        return res.status(400).json({
          mensaje:
            'El cliente seleccionado no existe',
        })
      }

      clienteId =
        Number(cliente_id)
    }

    let subtotalVenta = 0

    const detallePreparado:
      any[] = []

    for (const item of productos) {
      const productoId =
        Number(
          item.producto_id
        )

      const cantidad =
        Number(
          item.cantidad
        )

      if (
        !productoId ||
        Number.isNaN(cantidad) ||
        cantidad <= 0
      ) {
        throw new Error(
          'Producto o cantidad inválida'
        )
      }

      const [filas]: any =
        await conexion.query(
          `
          SELECT
            id,
            nombre,
            stock,
            precio_compra,
            precio_minorista,
            precio_mayorista
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
          'Producto no encontrado'
        )
      }

      const producto =
        filas[0]

      const stockActual =
        Number(
          producto.stock
        )

      if (
        cantidad >
        stockActual
      ) {
        throw new Error(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${stockActual}`
        )
      }

      const precio =
        tipoVenta ===
        'MAYORISTA'
          ? Number(
              producto.precio_mayorista
            )
          : Number(
              producto.precio_minorista
            )

      const costoUnitario =
        Number(
          producto.precio_compra
        ) || 0

      const subtotal =
        precio *
        cantidad

      subtotalVenta +=
        subtotal

      detallePreparado.push({
        producto_id:
          producto.id,

        nombre:
          producto.nombre,

        cantidad,

        precio,

        costo_unitario:
          costoUnitario,

        subtotal,

        stock_anterior:
          stockActual,

        stock_nuevo:
          stockActual -
          cantidad,
      })
    }

    const descuentoNumero =
      Math.max(
        0,
        Number(descuento) || 0
      )

    const total =
      Math.max(
        0,
        subtotalVenta -
        descuentoNumero
      )

    // Crear cabecera
    const [venta]: any =
      await conexion.query(
        `
        INSERT INTO ventas
        (
          usuario,
          cliente_id,
          tipo_venta,
          forma_pago,
          subtotal,
          descuento,
          total
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          usuario ||
            'Sin usuario',
          clienteId,
          tipoVenta,
          formaPago,
          subtotalVenta,
          descuentoNumero,
          total,
        ]
      )

    const ventaId =
      venta.insertId

    // Guardar detalle
    for (
      const item
      of detallePreparado
    ) {
      await conexion.query(
        `
        INSERT INTO detalle_ventas
        (
          venta_id,
          producto_id,
          cantidad,
          precio_unitario,
          costo_unitario,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          ventaId,
          item.producto_id,
          item.cantidad,
          item.precio,
          item.costo_unitario,
          item.subtotal,
        ]
      )

      await conexion.query(
        `
        UPDATE productos
        SET stock = ?
        WHERE id = ?
        `,
        [
          item.stock_nuevo,
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
        VALUES (?, 'SALIDA', ?, ?, ?, ?)
        `,
        [
          item.producto_id,
          item.cantidad,
          item.stock_anterior,
          item.stock_nuevo,
          `Venta #${ventaId}`,
        ]
      )
    }

    await conexion.commit()

    res.status(201).json({
      mensaje:
        'Venta registrada correctamente',

      venta_id:
        ventaId,

      subtotal:
        subtotalVenta,

      descuento:
        descuentoNumero,

      total,
    })
  } catch (error: any) {
    await conexion.rollback()

    console.error(error)

    res.status(400).json({
      mensaje:
        error.message ||
        'Error al registrar venta',
    })
  } finally {
    conexion.release()
  }
})

// Historial de ventas
router.get('/api/ventas', async (_req, res) => {
  try {
    const [ventas] =
      await db.query(`
        SELECT
          ventas.id,
          ventas.usuario,
          ventas.cliente_id,
          clientes.nombre AS cliente,
          ventas.tipo_venta,
          ventas.forma_pago,
          ventas.subtotal,
          ventas.descuento,
          ventas.total,
          ventas.fecha
        FROM ventas
        LEFT JOIN clientes
          ON clientes.id =
             ventas.cliente_id
        ORDER BY ventas.fecha DESC
      `)

    res.json(ventas)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener ventas',
    })
  }
})

// Detalle de venta
router.get(
  '/api/ventas/:id',
  async (req, res) => {
    try {
      const { id } =
        req.params

      const [ventas]: any =
        await db.query(
          `
          SELECT
            ventas.*,
            clientes.nombre AS cliente,
            clientes.dni_cuit,
            clientes.telefono,
            clientes.direccion
          FROM ventas
          LEFT JOIN clientes
            ON clientes.id =
               ventas.cliente_id
          WHERE ventas.id = ?
          `,
          [id]
        )

      if (
        ventas.length === 0
      ) {
        return res.status(404).json({
          mensaje:
            'Venta no encontrada',
        })
      }

      const [detalle] =
        await db.query(
          `
          SELECT
            detalle_ventas.id,
            detalle_ventas.producto_id,
            productos.nombre AS producto,
            productos.codigo_barras,
            detalle_ventas.cantidad,
            detalle_ventas.precio_unitario,
            detalle_ventas.costo_unitario,
            detalle_ventas.subtotal,

            (
              detalle_ventas.precio_unitario -
              detalle_ventas.costo_unitario
            ) *
            detalle_ventas.cantidad
            AS ganancia

          FROM detalle_ventas

          INNER JOIN productos
            ON productos.id =
               detalle_ventas.producto_id

          WHERE detalle_ventas.venta_id = ?
          `,
          [id]
        )

      res.json({
        venta:
          ventas[0],

        detalle,
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al obtener detalle de venta',
      })
    }
  }
)


export default router

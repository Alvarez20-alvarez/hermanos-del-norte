import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

// =====================================================
// REPORTES
// =====================================================

router.get(
  '/api/reportes/resumen',
  async (req, res) => {
    try {
      const hoy =
        new Date()
          .toISOString()
          .slice(0, 10)

      const desde =
        String(
          req.query.desde ||
          hoy
        )

      const hasta =
        String(
          req.query.hasta ||
          hoy
        )

      // -----------------------------------------------
      // VENTAS
      // -----------------------------------------------

      const [ventasResumen]: any =
        await db.query(
          `
          SELECT
            COUNT(*) AS cantidad_ventas,
            COALESCE(SUM(total), 0) AS total_ventas,
            COALESCE(SUM(descuento), 0) AS total_descuentos
          FROM ventas
          WHERE DATE(fecha)
          BETWEEN ? AND ?
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // COMPRAS
      // -----------------------------------------------

      const [comprasResumen]: any =
        await db.query(
          `
          SELECT
            COUNT(*) AS cantidad_compras,
            COALESCE(SUM(total), 0) AS total_compras
          FROM compras
          WHERE DATE(fecha)
          BETWEEN ? AND ?
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // GANANCIA REAL
      // -----------------------------------------------

      const [gananciaResumen]: any =
        await db.query(
          `
          SELECT

            COALESCE(
              SUM(
                detalle_ventas.costo_unitario
                *
                detalle_ventas.cantidad
              ),
              0
            ) AS costo_vendido,

            COALESCE(
              SUM(
                (
                  detalle_ventas.precio_unitario
                  -
                  detalle_ventas.costo_unitario
                )
                *
                detalle_ventas.cantidad
              ),
              0
            ) AS ganancia_bruta

          FROM detalle_ventas

          INNER JOIN ventas
            ON ventas.id =
               detalle_ventas.venta_id

          WHERE DATE(ventas.fecha)
          BETWEEN ? AND ?
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // PRODUCTOS MÁS VENDIDOS
      // -----------------------------------------------

      const [productosMasVendidos] =
        await db.query(
          `
          SELECT
            productos.id,
            productos.nombre,
            productos.presentacion,

            SUM(
              detalle_ventas.cantidad
            ) AS cantidad_vendida,

            SUM(
              detalle_ventas.subtotal
            ) AS total_vendido

          FROM detalle_ventas

          INNER JOIN ventas
            ON ventas.id =
               detalle_ventas.venta_id

          INNER JOIN productos
            ON productos.id =
               detalle_ventas.producto_id

          WHERE DATE(ventas.fecha)
          BETWEEN ? AND ?

          GROUP BY
            productos.id,
            productos.nombre,
            productos.presentacion

          ORDER BY
            cantidad_vendida DESC

          LIMIT 10
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // PRODUCTOS MÁS RENTABLES
      // -----------------------------------------------

      const [productosMasRentables] =
        await db.query(
          `
          SELECT

            productos.id,
            productos.nombre,
            productos.presentacion,

            SUM(
              detalle_ventas.cantidad
            ) AS cantidad_vendida,

            SUM(
              detalle_ventas.subtotal
            ) AS total_vendido,

            SUM(
              detalle_ventas.costo_unitario
              *
              detalle_ventas.cantidad
            ) AS costo_total,

            SUM(
              (
                detalle_ventas.precio_unitario
                -
                detalle_ventas.costo_unitario
              )
              *
              detalle_ventas.cantidad
            ) AS ganancia

          FROM detalle_ventas

          INNER JOIN ventas
            ON ventas.id =
               detalle_ventas.venta_id

          INNER JOIN productos
            ON productos.id =
               detalle_ventas.producto_id

          WHERE DATE(ventas.fecha)
          BETWEEN ? AND ?

          GROUP BY
            productos.id,
            productos.nombre,
            productos.presentacion

          ORDER BY
            ganancia DESC

          LIMIT 10
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // FORMAS DE PAGO
      // -----------------------------------------------

      const [ventasPorPago] =
        await db.query(
          `
          SELECT
            forma_pago,
            COUNT(*) AS cantidad,
            COALESCE(SUM(total), 0) AS total
          FROM ventas
          WHERE DATE(fecha)
          BETWEEN ? AND ?
          GROUP BY forma_pago
          ORDER BY total DESC
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // VENTAS POR DÍA
      // -----------------------------------------------

      const [ventasPorDia] =
        await db.query(
          `
          SELECT
            DATE(fecha) AS fecha,
            COUNT(*) AS cantidad,
            COALESCE(SUM(total), 0) AS total
          FROM ventas
          WHERE DATE(fecha)
          BETWEEN ? AND ?
          GROUP BY DATE(fecha)
          ORDER BY DATE(fecha)
          `,
          [
            desde,
            hasta,
          ]
        )

      // -----------------------------------------------
      // STOCK BAJO
      // -----------------------------------------------

      const [stockBajo] =
        await db.query(
          `
          SELECT
            id,
            nombre,
            presentacion,
            stock,
            stock_minimo
          FROM productos
          WHERE activo = TRUE
          AND stock <= stock_minimo
          ORDER BY stock ASC
          `
        )

      const totalVentas =
        Number(
          ventasResumen[0]
            ?.total_ventas || 0
        )

      const totalCompras =
        Number(
          comprasResumen[0]
            ?.total_compras || 0
        )

      const costoVendido =
        Number(
          gananciaResumen[0]
            ?.costo_vendido || 0
        )

      const gananciaBruta =
        Number(
          gananciaResumen[0]
            ?.ganancia_bruta || 0
        )

      const margenGanancia =
        totalVentas > 0
          ? (
              gananciaBruta /
              totalVentas
            ) * 100
          : 0

      res.json({
        desde,
        hasta,

        ventas: {
          cantidad:
            Number(
              ventasResumen[0]
                ?.cantidad_ventas || 0
            ),

          total:
            totalVentas,

          descuentos:
            Number(
              ventasResumen[0]
                ?.total_descuentos || 0
            ),
        },

        compras: {
          cantidad:
            Number(
              comprasResumen[0]
                ?.cantidad_compras || 0
            ),

          total:
            totalCompras,
        },

        movimiento_neto:
          totalVentas -
          totalCompras,

        rentabilidad: {
          costo_vendido:
            costoVendido,

          ganancia_bruta:
            gananciaBruta,

          margen:
            margenGanancia,
        },

        productos_mas_vendidos:
          productosMasVendidos,

        productos_mas_rentables:
          productosMasRentables,

        ventas_por_pago:
          ventasPorPago,

        ventas_por_dia:
          ventasPorDia,

        stock_bajo:
          stockBajo,
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        mensaje:
          'Error al generar el reporte',
      })
    }
  }
)


export default router

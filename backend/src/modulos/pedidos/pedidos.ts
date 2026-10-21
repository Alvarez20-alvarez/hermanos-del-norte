import { Router } from 'express'
import { db } from '../../config/db.js'

const router = Router()

const ESTADOS = ['PENDIENTE', 'ENTREGADO']
const FORMAS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'OTRO']

router.get('/api/pedidos', async (_req, res) => {
  try {
    const [pedidos]: any = await db.query(`
      SELECT
        pe.id,
        pe.cliente_id,
        pe.cliente_nombre,
        pe.telefono,
        pe.direccion,
        pe.referencia,
        pe.observacion,
        pe.estado,
        pe.usuario,
        pe.total,
        pe.fecha,
        pe.actualizado_en,
        COALESCE((
          SELECT SUM(pp.monto)
          FROM pagos_pedidos pp
          WHERE pp.pedido_id = pe.id
        ), 0) AS pagado,
        GREATEST(
          pe.total - COALESCE((
            SELECT SUM(pp2.monto)
            FROM pagos_pedidos pp2
            WHERE pp2.pedido_id = pe.id
          ), 0),
          0
        ) AS saldo
      FROM pedidos pe
      ORDER BY
        CASE pe.estado
          WHEN 'PENDIENTE' THEN 1
          ELSE 2
        END,
        pe.fecha DESC
    `)

    if (pedidos.length === 0) {
      return res.json([])
    }

    const ids = pedidos.map((pedido: any) => pedido.id)
    const marcadores = ids.map(() => '?').join(',')

    const [detalles]: any = await db.query(
      `
      SELECT
        dp.id,
        dp.pedido_id,
        dp.producto_id,
        p.nombre AS producto,
        p.presentacion,
        dp.cantidad,
        dp.precio_unitario,
        dp.subtotal
      FROM detalle_pedidos dp
      INNER JOIN productos p
        ON p.id = dp.producto_id
      WHERE dp.pedido_id IN (${marcadores})
      ORDER BY dp.id
      `,
      ids
    )

    const [pagos]: any = await db.query(
      `
      SELECT
        id,
        pedido_id,
        monto,
        forma_pago,
        nota,
        usuario,
        fecha
      FROM pagos_pedidos
      WHERE pedido_id IN (${marcadores})
      ORDER BY fecha DESC, id DESC
      `,
      ids
    )

    const detallesPorPedido = new Map<number, any[]>()
    const pagosPorPedido = new Map<number, any[]>()

    for (const detalle of detalles) {
      const lista = detallesPorPedido.get(detalle.pedido_id) || []
      lista.push(detalle)
      detallesPorPedido.set(detalle.pedido_id, lista)
    }

    for (const pago of pagos) {
      const lista = pagosPorPedido.get(pago.pedido_id) || []
      lista.push(pago)
      pagosPorPedido.set(pago.pedido_id, lista)
    }

    res.json(
      pedidos.map((pedido: any) => ({
        ...pedido,
        detalles: detallesPorPedido.get(pedido.id) || [],
        pagos: pagosPorPedido.get(pedido.id) || [],
      }))
    )
  } catch (error) {
    console.error(error)
    res.status(500).json({
      mensaje: 'Error al obtener los pedidos',
    })
  }
})

router.post('/api/pedidos', async (req, res) => {
  const conexion = await db.getConnection()

  try {
    const {
      cliente_id,
      cliente_nombre,
      telefono,
      direccion,
      referencia,
      observacion,
      usuario,
      productos,
    } = req.body

    if (!cliente_nombre || !String(cliente_nombre).trim()) {
      return res.status(400).json({
        mensaje: 'El nombre del cliente es obligatorio',
      })
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: 'El pedido debe tener productos',
      })
    }

    await conexion.beginTransaction()

    let clienteId: number | null = null
    let tipoCliente = 'MINORISTA'

    if (cliente_id) {
      const [clientes]: any = await conexion.query(
        `
        SELECT id, tipo_cliente
        FROM clientes
        WHERE id = ?
        AND activo = TRUE
        `,
        [cliente_id]
      )

      if (clientes.length === 0) {
        throw new Error('El cliente seleccionado no existe')
      }

      clienteId = Number(cliente_id)
      tipoCliente = clientes[0].tipo_cliente === 'MAYORISTA'
        ? 'MAYORISTA'
        : 'MINORISTA'
    }

    let total = 0
    const detallePreparado: any[] = []

    for (const item of productos) {
      const productoId = Number(item.producto_id)
      const cantidad = Number(item.cantidad)

      if (!productoId || !Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error('Producto o cantidad inválida')
      }

      const [filas]: any = await conexion.query(
        `
        SELECT
          id,
          nombre,
          stock,
          precio_minorista,
          precio_mayorista
        FROM productos
        WHERE id = ?
        AND activo = TRUE
        `,
        [productoId]
      )

      if (filas.length === 0) {
        throw new Error('Producto no encontrado')
      }

      const producto = filas[0]
      const stock = Number(producto.stock)

      if (cantidad > stock) {
        throw new Error(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${stock}`
        )
      }

      const precio = tipoCliente === 'MAYORISTA'
        ? Number(producto.precio_mayorista)
        : Number(producto.precio_minorista)

      const subtotal = precio * cantidad
      total += subtotal

      detallePreparado.push({
        producto_id: producto.id,
        cantidad,
        precio_unitario: precio,
        subtotal,
      })
    }

    const [resultado]: any = await conexion.query(
      `
      INSERT INTO pedidos
      (
        cliente_id,
        cliente_nombre,
        telefono,
        direccion,
        referencia,
        observacion,
        estado,
        usuario,
        total
      )
      VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', ?, ?)
      `,
      [
        clienteId,
        String(cliente_nombre).trim(),
        telefono || '',
        direccion || '',
        referencia || '',
        observacion || '',
        usuario || 'Sin usuario',
        total,
      ]
    )

    const pedidoId = resultado.insertId

    for (const item of detallePreparado) {
      await conexion.query(
        `
        INSERT INTO detalle_pedidos
        (
          pedido_id,
          producto_id,
          cantidad,
          precio_unitario,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          pedidoId,
          item.producto_id,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
        ]
      )
    }

    await conexion.commit()

    res.status(201).json({
      mensaje: 'Pedido guardado correctamente',
      pedido_id: pedidoId,
      total,
    })
  } catch (error) {
    await conexion.rollback()
    console.error(error)

    res.status(400).json({
      mensaje:
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el pedido',
    })
  } finally {
    conexion.release()
  }
})

router.put('/api/pedidos/:id/estado', async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado de pedido inválido',
      })
    }

    const [resultado]: any = await db.query(
      `
      UPDATE pedidos
      SET estado = ?, actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [estado, id]
    )

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Pedido no encontrado',
      })
    }

    res.json({
      mensaje: 'Estado actualizado correctamente',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      mensaje: 'No se pudo actualizar el pedido',
    })
  }
})

router.post('/api/pedidos/:id/pagos', async (req, res) => {
  const conexion = await db.getConnection()

  try {
    const pedidoId = Number(req.params.id)
    const monto = Number(req.body.monto)
    const formaPago = String(req.body.forma_pago || 'EFECTIVO').toUpperCase()
    const nota = String(req.body.nota || '').trim()
    const usuario = String(req.body.usuario || 'Sin usuario')

    if (!pedidoId || Number.isNaN(monto) || monto <= 0) {
      return res.status(400).json({
        mensaje: 'Monto inválido',
      })
    }

    if (!FORMAS_PAGO.includes(formaPago)) {
      return res.status(400).json({
        mensaje: 'Forma de pago inválida',
      })
    }

    await conexion.beginTransaction()

    const [pedidos]: any = await conexion.query(
      `
      SELECT
        pe.total,
        COALESCE((
          SELECT SUM(pp.monto)
          FROM pagos_pedidos pp
          WHERE pp.pedido_id = pe.id
        ), 0) AS pagado
      FROM pedidos pe
      WHERE pe.id = ?
      FOR UPDATE
      `,
      [pedidoId]
    )

    if (pedidos.length === 0) {
      throw new Error('Pedido no encontrado')
    }

    const total = Number(pedidos[0].total)
    const pagado = Number(pedidos[0].pagado)
    const saldo = Math.max(0, total - pagado)

    if (monto > saldo) {
      throw new Error(`El saldo pendiente es $${saldo.toLocaleString('es-AR')}`)
    }

    const [resultado]: any = await conexion.query(
      `
      INSERT INTO pagos_pedidos
      (pedido_id, monto, forma_pago, nota, usuario)
      VALUES (?, ?, ?, ?, ?)
      `,
      [pedidoId, monto, formaPago, nota, usuario]
    )

    await conexion.commit()

    res.status(201).json({
      mensaje: 'Pago registrado correctamente',
      pago_id: resultado.insertId,
      pagado: pagado + monto,
      saldo: Math.max(0, saldo - monto),
    })
  } catch (error) {
    await conexion.rollback()
    console.error(error)

    res.status(400).json({
      mensaje:
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el pago',
    })
  } finally {
    conexion.release()
  }
})

export default router

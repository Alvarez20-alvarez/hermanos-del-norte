import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import { db } from './db.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// =====================================================
// API PRINCIPAL
// =====================================================

app.get('/api', async (_req, res) => {
  res.json({
    mensaje: 'API de HERMANOS DEL NORTE funcionando',
  })
})

// =====================================================
// PRUEBA MYSQL
// =====================================================

app.get('/api/test-db', async (_req, res) => {
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

// =====================================================
// ROLES
// =====================================================

app.get('/api/roles', async (_req, res) => {
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

// =====================================================
// EMPLEADOS
// =====================================================

// Obtener empleados
app.get('/api/empleados', async (_req, res) => {
  try {
    const [empleados] = await db.query(`
      SELECT
        empleados.id,
        empleados.nombre,
        empleados.usuario,
        empleados.telefono,
        empleados.activo,
        empleados.created_at,
        empleados.updated_at,
        roles.id AS rol_id,
        roles.nombre AS rol
      FROM empleados
      INNER JOIN roles
        ON roles.id = empleados.rol_id
      ORDER BY empleados.nombre
    `)

    res.json(empleados)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje: 'Error al obtener empleados',
    })
  }
})

// Crear empleado
app.post('/api/empleados', async (req, res) => {
  try {
    const {
      nombre,
      usuario,
      password,
      rol_id,
      telefono,
    } = req.body

    if (!nombre || !usuario || !password || !rol_id) {
      return res.status(400).json({
        mensaje:
          'Nombre, usuario, contraseña y rol son obligatorios',
      })
    }

    const passwordHash =
      await bcrypt.hash(password, 10)

    const [resultado]: any =
      await db.query(
        `
        INSERT INTO empleados
        (
          nombre,
          usuario,
          password_hash,
          rol_id,
          telefono
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          nombre,
          usuario,
          passwordHash,
          Number(rol_id),
          telefono || '',
        ]
      )

    res.status(201).json({
      mensaje: 'Empleado creado correctamente',
      empleado_id: resultado.insertId,
    })
  } catch (error: any) {
    console.error(error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensaje:
          'Ese nombre de usuario ya está registrado',
      })
    }

    res.status(500).json({
      mensaje: 'Error al crear empleado',
    })
  }
})

// Editar empleado
app.put('/api/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params

    const {
      nombre,
      usuario,
      password,
      rol_id,
      telefono,
      activo,
    } = req.body

    if (!nombre || !usuario || !rol_id) {
      return res.status(400).json({
        mensaje:
          'Nombre, usuario y rol son obligatorios',
      })
    }

    const activoFinal =
      activo === undefined
        ? 1
        : activo
          ? 1
          : 0

    if (
      password &&
      password.trim() !== ''
    ) {
      const passwordHash =
        await bcrypt.hash(
          password,
          10
        )

      await db.query(
        `
        UPDATE empleados
        SET
          nombre = ?,
          usuario = ?,
          password_hash = ?,
          rol_id = ?,
          telefono = ?,
          activo = ?
        WHERE id = ?
        `,
        [
          nombre,
          usuario,
          passwordHash,
          Number(rol_id),
          telefono || '',
          activoFinal,
          id,
        ]
      )
    } else {
      await db.query(
        `
        UPDATE empleados
        SET
          nombre = ?,
          usuario = ?,
          rol_id = ?,
          telefono = ?,
          activo = ?
        WHERE id = ?
        `,
        [
          nombre,
          usuario,
          Number(rol_id),
          telefono || '',
          activoFinal,
          id,
        ]
      )
    }

    res.json({
      mensaje:
        'Empleado actualizado correctamente',
    })
  } catch (error: any) {
    console.error(error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        mensaje:
          'Ese nombre de usuario ya pertenece a otro empleado',
      })
    }

    res.status(500).json({
      mensaje:
        'Error al actualizar empleado',
    })
  }
})

// =====================================================
// LOGIN
// =====================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const {
      usuario,
      password,
    } = req.body

    if (!usuario || !password) {
      return res.status(400).json({
        mensaje:
          'Usuario y contraseña son obligatorios',
      })
    }

    const [filas]: any =
      await db.query(
        `
        SELECT
          empleados.id,
          empleados.nombre,
          empleados.usuario,
          empleados.password_hash,
          empleados.telefono,
          empleados.activo,
          roles.id AS rol_id,
          roles.nombre AS rol
        FROM empleados
        INNER JOIN roles
          ON roles.id = empleados.rol_id
        WHERE empleados.usuario = ?
        LIMIT 1
        `,
        [usuario]
      )

    if (filas.length === 0) {
      return res.status(401).json({
        mensaje:
          'Usuario o contraseña incorrectos',
      })
    }

    const empleado =
      filas[0]

    if (!empleado.activo) {
      return res.status(403).json({
        mensaje:
          'Este usuario está desactivado',
      })
    }

    const passwordCorrecta =
      await bcrypt.compare(
        password,
        empleado.password_hash
      )

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje:
          'Usuario o contraseña incorrectos',
      })
    }

    res.json({
      mensaje:
        'Inicio de sesión correcto',

      usuario: {
        id: empleado.id,
        nombre: empleado.nombre,
        usuario: empleado.usuario,
        rol: empleado.rol,
        rol_id: empleado.rol_id,
        telefono: empleado.telefono,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al iniciar sesión',
    })
  }
})

// =====================================================
// PRODUCTOS
// =====================================================

// Obtener productos
app.get('/api/productos', async (_req, res) => {
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
app.get(
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
app.post('/api/productos', async (req, res) => {
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
app.put('/api/productos/:id', async (req, res) => {
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

// =====================================================
// CLIENTES
// =====================================================

// Obtener clientes
app.get('/api/clientes', async (_req, res) => {
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
app.post('/api/clientes', async (req, res) => {
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
app.put('/api/clientes/:id', async (req, res) => {
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
app.delete(
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

// =====================================================
// STOCK
// =====================================================

// Historial
app.get(
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
app.post(
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

// =====================================================
// VENTAS
// =====================================================

// Crear venta
app.post('/api/ventas', async (req, res) => {
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
app.get('/api/ventas', async (_req, res) => {
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
app.get(
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

// =====================================================
// PROVEEDORES
// =====================================================

// Obtener proveedores
app.get('/api/proveedores', async (_req, res) => {
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
app.post('/api/proveedores', async (req, res) => {
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
app.put(
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
app.delete(
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

// =====================================================
// COMPRAS
// =====================================================

// Registrar compra
app.post('/api/compras', async (req, res) => {
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
app.get('/api/compras', async (_req, res) => {
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
app.get(
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

// =====================================================
// REPORTES
// =====================================================

app.get(
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

// =====================================================
// CONFIGURACION
// =====================================================

// Obtener configuración
app.get('/api/configuracion', async (_req, res) => {
  try {
    const [filas]: any = await db.query(`
      SELECT
        id,
        nombre_empresa,
        cuit,
        direccion,
        telefono,
        email,
        alias_pago,
        updated_at
      FROM configuracion
      WHERE id = 1
      LIMIT 1
    `)

    if (filas.length === 0) {
      return res.json({
        nombre_empresa:
          'HERMANOS DEL NORTE',
        cuit: '',
        direccion: '',
        telefono: '',
        email: '',
        alias_pago: '',
      })
    }

    res.json(filas[0])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al obtener la configuración',
    })
  }
})

// Guardar configuración
app.put('/api/configuracion', async (req, res) => {
  try {
    const {
      nombre_empresa,
      cuit,
      direccion,
      telefono,
      email,
      alias_pago,
    } = req.body

    if (!nombre_empresa) {
      return res.status(400).json({
        mensaje:
          'El nombre de la empresa es obligatorio',
      })
    }

    await db.query(
      `
      INSERT INTO configuracion
      (
        id,
        nombre_empresa,
        cuit,
        direccion,
        telefono,
        email,
        alias_pago
      )
      VALUES
      (
        1, ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        nombre_empresa = VALUES(nombre_empresa),
        cuit = VALUES(cuit),
        direccion = VALUES(direccion),
        telefono = VALUES(telefono),
        email = VALUES(email),
        alias_pago = VALUES(alias_pago)
      `,
      [
        nombre_empresa,
        cuit || '',
        direccion || '',
        telefono || '',
        email || '',
        alias_pago || '',
      ]
    )

    res.json({
      mensaje:
        'Configuración guardada correctamente',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      mensaje:
        'Error al guardar la configuración',
    })
  }
})


// =====================================================
// SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(
    `Servidor funcionando en http://localhost:${PORT}`
  )
})
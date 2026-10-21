import { Router } from 'express'
import { db } from '../../config/db.js'
import bcrypt from 'bcrypt'

const router = Router()

// =====================================================
// EMPLEADOS
// =====================================================

// Obtener empleados
router.get('/api/empleados', async (_req, res) => {
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
router.post('/api/empleados', async (req, res) => {
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
router.put('/api/empleados/:id', async (req, res) => {
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


export default router

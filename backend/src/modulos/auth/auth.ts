import { Router } from 'express'
import { db } from '../../config/db.js'
import bcrypt from 'bcrypt'

const router = Router()

// =====================================================
// LOGIN
// =====================================================

router.post('/api/auth/login', async (req, res) => {
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


export default router

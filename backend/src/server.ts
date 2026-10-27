import express from 'express'
import cors from 'cors'

import sistemaRoutes from './modulos/sistema/sistema.js'
import rolesRoutes from './modulos/roles/roles.js'
import empleadosRoutes from './modulos/empleados/empleados.js'
import authRoutes from './modulos/auth/auth.js'
import productosRoutes from './modulos/productos/productos.js'
import clientesRoutes from './modulos/clientes/clientes.js'
import stockRoutes from './modulos/stock/stock.js'
import ventasRoutes from './modulos/ventas/ventas.js'
import cajaRoutes from './modulos/caja/caja.js'
import pedidosRoutes from './modulos/pedidos/pedidos.js'
import proveedoresRoutes from './modulos/proveedores/proveedores.js'
import comprasRoutes from './modulos/compras/compras.js'
import reportesRoutes from './modulos/reportes/reportes.js'
import configuracionRoutes from './modulos/configuracion/configuracion.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use(sistemaRoutes)
app.use(rolesRoutes)
app.use(empleadosRoutes)
app.use(authRoutes)
app.use(productosRoutes)
app.use(clientesRoutes)
app.use(stockRoutes)
app.use(ventasRoutes)
app.use(cajaRoutes)
app.use(pedidosRoutes)
app.use(proveedoresRoutes)
app.use(comprasRoutes)
app.use(reportesRoutes)
app.use(configuracionRoutes)

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`)
})

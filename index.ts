import express from 'express'
import routesClientes from './routes/clientes'
import routesViagens from './routes/viagem'
import routesReservas from './routes/reservas'
import routesPagamentos from './routes/pagamentos'
import routesUsuario from './routes/usuario'
import "./routes/verificaToken";
import logs from './routes/logs'

const app = express()
const port = 3000

app.use(express.json())

app.use("/clientes", routesClientes)
app.use("/viagens", routesViagens)
app.use("/reservas", routesReservas)
app.use("/pagamentos", routesPagamentos)
app.use("/usuario", routesUsuario)
app.use("/logs", logs)
app.get('/', (req, res) => {
  res.send('API: Controle de Viagens')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})
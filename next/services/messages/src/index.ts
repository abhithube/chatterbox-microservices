import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const API_PREFIX = process.env.API_PREFIX ?? '/api/v1'
const PORT = process.env.PORT ?? 80

const app = express()
const server = createServer(app)
const io = new Server(server, {
  path: API_PREFIX + '/socket.io',
})

const router = express.Router()

router.get('/health', (req, res) => {
  res.send('OK')
})

app.use(API_PREFIX, router)

io.on('connection', (socket) => {
  const auth = socket.handshake.headers.authorization
  if (!auth) {
    socket.disconnect(true)

    return
  }

  const token = auth.split(' ')[1]
  console.log(token)
})

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})

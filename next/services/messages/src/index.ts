import express from 'express'
import { JWTPayload, jwtVerify } from 'jose'
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

io.on('connection', async (socket) => {
  const auth = socket.handshake.headers.authorization
  if (!auth) {
    socket.disconnect(true)

    return
  }

  let payload: JWTPayload

  try {
    const token = auth.split(' ')[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    payload = (await jwtVerify(token, secret)).payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    socket.disconnect(true)

    return
  }

  console.log(payload)
})

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})

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

  let partyId: string | undefined
  let topicId: string | undefined

  socket.on('party:join', (id: string) => {
    if (partyId) {
      socket.leave(`party:${partyId}`)
      io.to(`party:${partyId}`).emit('party:left', payload.sub)
    }

    socket.join(`party:${id}`)
    io.to(`party:${id}`).emit('party:joined', payload.sub)

    partyId = id

    console.log(`user ${payload.sub} joined party ${id}`)
  })

  socket.on('topic:join', (id: string) => {
    if (!partyId) {
      return
    }
    if (topicId) {
      socket.leave(`topic:${topicId}`)
    }

    socket.join(`topic:${id}`)
    topicId = id

    console.log(`user ${payload.sub} joined topic ${id}`)
  })
})

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})

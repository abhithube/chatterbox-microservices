import express from 'express'
import { jwtVerify } from 'jose'
import { createServer } from 'node:http'
import { DefaultEventsMap, RemoteSocket, Server, Socket } from 'socket.io'

type SocketData = {
  user: {
    id: string
    name: string
    image: string | null
  }
  partyId?: string
  topicId?: string
}

type UserSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>

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

io.on('connection', async (socket: UserSocket) => {
  const auth = socket.handshake.headers.authorization
  if (!auth) {
    socket.disconnect(true)

    return
  }

  try {
    const token = auth.split(' ')[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const payload = (await jwtVerify(token, secret)).payload

    socket.data.user = {
      id: payload.sub!,
      name: payload.name as string,
      image: payload.image as string,
    }
  } catch (error) {
    socket.disconnect(true)

    return
  }

  socket.on(
    'party:join',
    async (id: string, callback: (users: string[]) => void) => {
      if (socket.data.partyId) {
        socket.leave(`party:${socket.data.partyId}`)
        io.to(`party:${socket.data.partyId}`).emit(
          'party:left',
          socket.data.user.id,
        )
      }

      socket.join(`party:${id}`)
      io.to(`party:${id}`).emit('party:joined', socket.data.user.id)

      socket.data.partyId = id

      console.log(`user ${socket.data.user.id} joined party ${id}`)

      const users = await getUsers(id)

      callback(users)
    },
  )

  socket.on('topic:join', (id: string) => {
    if (!socket.data.partyId) {
      return
    }
    if (socket.data.topicId) {
      socket.leave(`topic:${socket.data.topicId}`)
    }

    socket.join(`topic:${id}`)
    socket.data.topicId = id

    console.log(`user ${socket.data.user.id} joined topic ${id}`)
  })
})

async function getUsers(partyId: string): Promise<string[]> {
  const sockets: RemoteSocket<DefaultEventsMap, SocketData>[] = await io
    .in(`party:${partyId}`)
    .fetchSockets()

  return sockets.map((socket) => socket.data.user.id)
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})

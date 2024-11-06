'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { io } from 'socket.io-client'
import { Message } from './types'

const socket = io(process.env.NEXT_PUBLIC_API_ORIGIN, {
  path: process.env.NEXT_PUBLIC_API_PATH + '/socket.io',
  transports: ['polling'],
  autoConnect: false,
})

export type SocketState = {
  connected: boolean
  users: string[]
  messages: Message[]
  connect: (token: string) => void
  disconnect: () => void
  joinParty: (partyId: string) => void
  joinTopic: (topicId: string) => void
  sendMessage: (body: string) => void
}

const SocketContext = createContext<SocketState>({
  connected: false,
  users: [],
  messages: [],
  connect: () => {},
  disconnect: () => {},
  joinParty: () => {},
  joinTopic: () => {},
  sendMessage: () => {},
})

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('party:joined', (userId: string) => {
      setUsers((users) => [...users, userId])
    })

    socket.on('party:left', (userId: string) => {
      setUsers((users) => users.filter((user) => user !== userId))
    })

    socket.on('message:created', (message: Message) => {
      setMessages((messages) => [message, ...messages])
    })
  }, [])

  const connect = useCallback((token: string) => {
    socket.io.opts.extraHeaders = {
      authorization: `Bearer ${token}`,
    }

    socket.connect()
  }, [])

  const disconnect = useCallback(() => {
    socket.disconnect()

    delete socket.io.opts.extraHeaders?.authorization
  }, [])

  const joinParty = useCallback((partyId: string) => {
    socket.emit('party:join', partyId, (users: string[]) => {
      setUsers(users)
    })
  }, [])

  const joinTopic = useCallback((topicId: string) => {
    setMessages([])

    socket.emit('topic:join', topicId, (messages: Message[]) => {
      setMessages(messages)
    })
  }, [])

  const sendMessage = useCallback((body: string) => {
    socket.emit('message:create', body)
  }, [])

  return (
    <SocketContext.Provider
      value={{
        connected,
        users,
        messages,
        connect,
        disconnect,
        joinParty,
        joinTopic,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

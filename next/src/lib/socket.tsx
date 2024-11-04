'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_API_ORIGIN, {
  path: process.env.NEXT_PUBLIC_API_PATH + '/socket.io',
  transports: ['polling'],
  autoConnect: false,
})

export type SocketState = {
  connected: boolean
  connect: (token: string) => void
  disconnect: () => void
}

const SocketContext = createContext<SocketState>({
  connected: false,
  connect: () => {},
  disconnect: () => {},
})

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
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

  return (
    <SocketContext.Provider
      value={{
        connected,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

'use client'

import { Input } from '@/components/ui/input'
import { useSocket } from '@/lib/socket'
import { Topic } from '@/lib/types'
import { Play } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

export function MessageForm({ topic }: { topic: Topic }) {
  const { sendMessage } = useSocket()

  const [message, setMessage] = useState('')

  return (
    <form
      className="mx-4"
      onSubmit={(e) => {
        e.preventDefault()
        sendMessage(message)
      }}
    >
      <div className="flex space-x-4">
        <Input
          id="message"
          placeholder={`Message '${topic.title}'`}
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
        />
        <Button type="submit" disabled={message.length === 0}>
          <Play />
        </Button>
      </div>
    </form>
  )
}

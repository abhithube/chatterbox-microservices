import { Input } from '@/components/ui/input'
import { Topic } from '@/lib/types'
import { Play } from 'lucide-react'
import { Button } from './ui/button'

export async function MessageForm({ topic }: { topic: Topic }) {
  return (
    <form className="mx-4">
      <div className="flex space-x-4">
        <Input id="message" placeholder={`Message '${topic.title}'`} />
        <Button type="submit">
          <Play />
        </Button>
      </div>
    </form>
  )
}

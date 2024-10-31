import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PartyDialog() {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <form>
        <DialogHeader>
          <DialogTitle>Create Party</DialogTitle>
          <DialogDescription>
            Create a new party to connect with others.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Enter a party name..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Submit</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

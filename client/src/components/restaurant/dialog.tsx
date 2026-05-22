import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

import { Button } from '@/components/ui/button'
import { CuisineType } from '#/lib/types/restaurant'
import { Errors } from '#/components/ui/errors'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { restaurantFormOpts } from '#/lib/forms/restaurant'
import { useTypedAppFormContext } from '#/lib/forms/app'

export default function RestaurantDialog({
  onCancel,
  isPending,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  onCancel?: () => void
  isPending?: boolean
}) {
  const form = useTypedAppFormContext(restaurantFormOpts)

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Keep track of new culinary spots to try or save your favorites.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Restaurant Name Field */}
          <form.Field name="name">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Osteria Francescana"
                />
                <Errors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Cuisine Field */}
            <form.Field name="cuisine">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Cuisine</Label>
                  <Select
                    value={field.state.value || ''}
                    onValueChange={(v) => field.handleChange(v as CuisineType)}
                  >
                    <SelectTrigger className="w-full max-w-48">
                      <SelectValue placeholder="e.g., Italian, Sushi" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CuisineType).map(([label, type]) => (
                        <SelectItem value={type} key={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            {/* Location Field */}
            <form.Field name="location">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Location / Neighborhood</Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Zurich, Downtown"
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

          {/* Menu Link Field */}
          <form.Field name="menuLink">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Menu Link</Label>
                <Input
                  id={field.name}
                  type="url"
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://example.com/menu"
                />
                <Errors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {/* Tags Field */}
          <form.Field name="tags">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Tags</Label>
                <Input
                  id={field.name}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., date night, outdoor seating, budget friendly"
                />
                <p className="text-[11px] text-muted-foreground">
                  Separate your descriptive custom labels with commas.
                </p>
              </div>
            )}
          </form.Field>

          {/* Action Triggers */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Restaurant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

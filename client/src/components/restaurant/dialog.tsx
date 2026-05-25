import { CuisineType, Reservation } from '#/lib/types/restaurant'
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
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'

import { Button } from '@/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Errors } from '#/components/ui/errors'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagInput } from '#/components/ui/tag-input'
import { restaurantFormOpts } from '#/lib/forms/restaurant'
import { restaurantTagsQuery } from '#/lib/queries/restaurant'
import { useQuery } from '@tanstack/react-query'
import { useTeamContext } from '#/contexts/team'
import { useTypedAppFormContext } from '#/lib/forms/app'

export default function RestaurantDialog({
  onCancel,
  isPending,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  onCancel?: () => void
  isPending?: boolean
}) {
  const { activeTeam } = useTeamContext()

  const form = useTypedAppFormContext(restaurantFormOpts)

  const { data: tags } = useQuery(restaurantTagsQuery(activeTeam))

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
          className="space-y-4 max-h-[calc(100vh-200px)] sm:max-h-full overflow-y-auto"
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

          <div className="grid md:grid-cols-2 gap-4">
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

            <form.Field name="dogFriendly">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Dog Friendly</Label>
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <form.Field name="location">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Location</Label>
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

            <form.Field name="googleMapsEmbed">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Google Maps Embed</Label>
                  <Input
                    id={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      let input = e.target.value
                      let url = ''

                      if (
                        /<iframe src="([a-zA-Z0-9:\\/\\?!\\.=%&#;]*)"/.test(
                          input,
                        )
                      ) {
                        const doc = new DOMParser().parseFromString(
                          input,
                          'text/html',
                        )
                        input = doc.querySelector('iframe')?.src ?? input
                        console.log(input)
                      }

                      try {
                        const urlObj = new URL(input)
                        url = urlObj.toString()
                      } catch {}

                      if (url) {
                        field.handleChange(url)
                      }
                    }}
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

          <div className="flex flex-col md:flex-row gap-4">
            <form.Field name="reservation">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Reservation</Label>
                  <ToggleGroup
                    value={field.state.value}
                    onValueChange={(v) =>
                      v && field.handleChange(v as Reservation)
                    }
                    type="single"
                    variant="outline"
                  >
                    {Object.entries(Reservation).map(([label, value]) => (
                      <ToggleGroupItem value={value} key={value}>
                        {label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="parkingAvailable">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Parking Available</Label>
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>

          {/* Tags Field */}
          <form.Field name="tags">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Tags</Label>
                <TagInput
                  tags={
                    field.state.value?.map((t) => ({ label: t, value: t })) ??
                    []
                  }
                  setTags={(tags) =>
                    field.handleChange(tags.map((t) => t.value))
                  }
                  allTags={tags.map((t) => ({ label: t, value: t }))}
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

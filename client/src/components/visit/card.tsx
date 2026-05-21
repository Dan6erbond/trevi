import { Card, CardContent, CardHeader } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Pencil, Star, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Errors } from '#/components/ui/errors'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { env } from '#/env'
import type { Visit } from '#/lib/types/visit'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { format } from 'date-fns'
import { useState } from 'react'
import z from 'zod'
import { StarRatingInput } from '#/components/ui/star-rating'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

const formatCHF = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)

const formatCHFPerPerson = (cost: number, party_size: number) => {
  if (!party_size) return formatCHF(cost)
  return formatCHF(cost / party_size)
}

export function VisitCard({ visit }: { visit: Visit }) {
  const queryClient = useQueryClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const createReview = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      try {
        const res = await axios.post(
          `${env.VITE_SERVER_URL}/api/visits/${visit.id}/reviews`,
          values,
        )

        return res.data
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data.errors) {
            form.setErrorMap({
              onSubmit: {
                fields: error.response.data.errors,
              },
            })
          }
        }

        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      setIsCreateOpen(false)
      form.reset()
    },
  })

  const form = useForm({
    defaultValues: {
      rating: 5,
      review: '',
    } satisfies ReviewFormValues,
    validators: {
      onChange: reviewSchema,
    },
    onSubmit: async ({ value }) => {
      await createReview.mutateAsync(value)
    },
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex gap-1 items-center">
              {/* Title */}
              <div className="text-sm font-medium text-foreground">
                {visit.title || 'Untitled visit'}
              </div>

              {/* Date */}
              <div className="text-xs text-muted-foreground">
                · {format(new Date(visit.visited_at), 'MMMM d, yyyy')}
              </div>
            </div>

            {/* Meta row */}
            {(visit.cost || visit.party_size) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                {visit.party_size != null && <span>👥 {visit.party_size}</span>}

                {visit.cost != null && visit.party_size != null && (
                  <span>
                    💰 {formatCHF(visit.cost)} ·{' '}
                    {formatCHFPerPerson(visit.cost, visit.party_size)} / person
                  </span>
                )}

                {visit.cost != null && visit.party_size == null && (
                  <span>💰 {formatCHF(visit.cost)}</span>
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
        </div>
      </CardHeader>
      {/* Content placeholder (optional visit note) */}
      <CardContent className="space-y-3">
        {/* Reviews / comments section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reviews
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              Add review
            </Button>
          </div>

          {/* Reviews list */}
          <div className="space-y-2">
            {([].length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            )}

            {[
              {
                id: 1,
                created_at: new Date().toISOString(),
                text: 'Awesome food!',
              },
            ].map((r) => (
              <div
                key={r.id}
                className="rounded-lg border bg-muted/30 p-3 space-y-2"
              >
                {/* Review header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-foreground">{r.text}</p>

                {/* Optional tags */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    Cacio e Pepe
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    Cozy
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
            <DialogDescription>
              Add a review for your visit on{' '}
              <span className="font-semibold text-foreground">
                {format(new Date(visit.visited_at), 'MMMM d, yyyy')}
              </span>
              .
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
            <form.Field name="rating">
              {(field) => (
                <div className="space-y-2">
                  <Label>Rating</Label>

                  <StarRatingInput
                    value={field.state.value}
                    onChange={field.handleChange}
                  />

                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="review">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Visited at</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your review"
                  />
                  <Errors errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            {/* Action Triggers */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? 'Saving…' : 'Save visit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

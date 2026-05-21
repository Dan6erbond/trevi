import { Star } from 'lucide-react'
import { useState } from 'react'

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        const active = (hover ?? value) >= starValue

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(null)}
            className="transition"
          >
            <Star
              className={`h-5 w-5 ${
                active ? 'fill-primary text-primary' : 'text-muted-foreground'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

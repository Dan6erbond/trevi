import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCHF(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
}

export function getDollarRating(avg: number) {
  if (avg < 25) return '$'
  if (avg < 50) return '$$'
  if (avg < 90) return '$$$'
  return '$$$$'
}

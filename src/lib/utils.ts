/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add any other utility functions here

export function formatPrazo(prazo: string, horario?: string): string {
  if (!prazo) return '—'
  const datePart = prazo.split('T')[0]
  const parts = datePart.split('-')
  if (parts.length !== 3) return prazo
  const [year, month, day] = parts
  const dd = day.padStart(2, '0')
  const mm = month.padStart(2, '0')
  let time = horario || '00:00'
  const timeParts = time.split(':')
  if (timeParts.length >= 2) {
    const hh = timeParts[0].padStart(2, '0')
    const min = timeParts[1].padStart(2, '0')
    time = `${hh}:${min}`
  }
  return `${dd}-${mm}-${year} ${time}`
}

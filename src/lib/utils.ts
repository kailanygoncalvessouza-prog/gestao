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
  const parts = prazo.split('T')[0].split('-')
  if (parts.length !== 3) return prazo
  const time = horario || '00:00'
  return `${parts[2]}-${parts[1]}-${parts[0]} ${time}`
}

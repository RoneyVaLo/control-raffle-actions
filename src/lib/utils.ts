import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `₡${amount.toLocaleString('es-CR')}`
}

export function parseActionRange(input: string): number[] {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) {
    return [parseInt(trimmed, 10)]
  }
  const rangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10)
    const end = parseInt(rangeMatch[2], 10)
    if (start <= end) {
      const result: number[] = []
      for (let i = start; i <= end; i++) {
        result.push(i)
      }
      return result
    }
  }
  const parts = trimmed.split(/[,;]+/).map(s => s.trim()).filter(Boolean)
  if (parts.every(p => /^\d+$/.test(p))) {
    return parts.map(p => parseInt(p, 10))
  }
  return []
}

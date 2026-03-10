import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createHash } from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Hash an IP address for privacy-safe storage */
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip + 'glimr-salt').digest('hex').slice(0, 16)
}

/** Extract client IP from request headers */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}

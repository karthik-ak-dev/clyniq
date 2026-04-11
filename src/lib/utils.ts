import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns today's date as YYYY-MM-DD in UTC.
 */
export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

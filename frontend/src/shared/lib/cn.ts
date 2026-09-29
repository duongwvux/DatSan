import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Gộp className có điều kiện và loại bỏ class Tailwind xung đột. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, letting a caller's utility win over a component's default
 * for the same CSS property (`px-4` passed in beats a built-in `px-6`) rather
 * than both landing in the class list and the outcome depending on stylesheet
 * order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

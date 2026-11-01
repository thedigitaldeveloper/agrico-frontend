/**
 * Shared shape for server-action form results.
 *
 * Kept out of actions.ts because a `'use server'` module may only export async
 * functions — exporting a type or a constant from one is a runtime error, and
 * one that `next build` does not catch.
 */
export interface FormState {
  status: 'idle' | 'success' | 'error';
  message: string;
  /** Field names that failed validation, for aria-invalid. */
  invalid?: string[];
}

export const IDLE: FormState = { status: 'idle', message: '' };

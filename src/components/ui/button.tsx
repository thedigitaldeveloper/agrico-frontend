import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'accent'
  | 'inverse'
  | 'danger'
  | 'danger-outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900 active:bg-brand-950',
  accent: 'bg-brand-800 text-white hover:bg-brand-900 active:bg-brand-950',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  outline:
    'border border-ink-300 bg-white text-ink-900 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  // The secondary action on a maroon hero or CTA panel. `outline` is white on
  // white there, which is why call sites were reaching past `variant` and
  // writing these four classes out by hand.
  inverse: 'border border-white/25 bg-white/10 text-white hover:bg-white/20',
  // Cancelling a booking and declining a request are irreversible; the outline
  // form is for when such an action sits beside a heavier primary one.
  danger: 'bg-danger-500 text-white hover:bg-danger-700 active:bg-danger-700',
  'danger-outline':
    'border border-danger-500/40 bg-white text-danger-700 hover:border-danger-500 hover:bg-danger-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  // Square and 44px, the minimum comfortable touch target — icon-only controls
  // have no label to widen them, so the size has to come from the box.
  icon: 'size-11 p-0',
};

const BASE =
  'inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap ' +
  'transition-colors duration-150 select-none ' +
  'disabled:pointer-events-none disabled:opacity-50';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>;

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

/**
 * Same visual treatment as Button, but renders an anchor. Kept as a separate
 * component rather than an `as` prop so navigation stays a real link — right
 * click, middle click and prefetch all keep working.
 */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
    </Link>
  );
}

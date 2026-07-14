import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-[family-name:var(--font-body)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sunset-gold)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--hero-cta-bg)] text-[var(--color-capiz)] font-semibold uppercase tracking-[0.18em] hover:bg-[var(--hero-cta-bg-hover)]',
        secondary:
          'bg-[var(--color-capiz)] text-[var(--color-text)] font-medium hover:bg-[color-mix(in_srgb,var(--color-capiz)_85%,transparent)]',
        outline:
          'border border-solid border-[color:rgba(245,242,234,0.45)] bg-[rgba(42,50,54,0.55)] text-[var(--color-capiz)] no-underline font-normal uppercase tracking-[0.18em] backdrop-blur-[6px] hover:border-[color:var(--color-sunset-gold)] hover:text-[var(--color-sunset-gold)] hover:bg-[rgba(42,50,54,0.55)]',
        ghost:
          'bg-transparent text-[var(--color-capiz)] font-medium hover:bg-[color-mix(in_srgb,var(--color-capiz)_12%,transparent)]',
        link: 'bg-transparent text-[var(--color-capiz)] font-medium underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 text-[0.8125rem]',
        sm: 'h-9 px-3 text-xs',
        lg: 'min-h-11 px-7 py-[0.85rem] text-[0.875rem]',
        icon: 'h-10 w-10 text-[0.8125rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sunset-gold)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--hero-cta-bg)] text-[var(--hero-cta-text)] hover:bg-[var(--hero-cta-bg-hover)]',
        secondary:
          'bg-[var(--color-capiz)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-capiz)_85%,transparent)]',
        outline:
          'border border-[var(--hero-cta-outline-border)] bg-[var(--hero-cta-outline-bg)] text-[var(--hero-cta-text)] backdrop-blur-[6px] hover:border-[var(--hero-cta-outline-hover)] hover:text-[var(--hero-cta-outline-hover)] hover:bg-[var(--hero-cta-outline-bg)]',
        ghost:
          'bg-transparent text-[var(--hero-text)] hover:bg-[color-mix(in_srgb,var(--color-capiz)_12%,transparent)]',
        link: 'bg-transparent text-[var(--hero-text)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

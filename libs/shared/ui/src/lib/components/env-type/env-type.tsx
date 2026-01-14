import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef } from 'react'
import { match } from 'ts-pattern'
import { twMerge } from '@qovery/shared/util-js'

const _envTypeVariants = cva(
  ['inline-flex', 'items-center', 'justify-center', 'border', 'border-neutral', 'font-semibold'],
  {
    variants: {
      type: {
        production: ['border-negative-strong', 'bg-surface-negative-subtle', 'text-negative'],
        ephemeral: ['border-accent1-strong', 'bg-surface-accent1-component', 'text-accent1'],
        staging: ['border-neutral-strong', 'bg-surface-neutral-component', 'text-neutral'],
        development: ['border-neutral-component', 'bg-surface-neutral-subtle', 'text-neutral-subtle'],
      },
      size: {
        sm: ['text-2xs', 'h-4', 'w-4', 'rounded-[3px]'],
        lg: ['text-xs', 'h-6', 'w-6', 'rounded-[4px]'],
      },
    },
    defaultVariants: {
      type: 'production',
      size: 'sm',
    },
  }
)

export interface EnvTypeProps extends VariantProps<typeof _envTypeVariants>, ComponentPropsWithoutRef<'div'> {
  type: 'production' | 'staging' | 'development' | 'ephemeral'
}

export const EnvType = ({ type, size, className }: EnvTypeProps) => {
  return (
    <div className={twMerge(_envTypeVariants({ type, size }), className)}>
      {match(type)
        .with('production', () => 'P')
        .with('staging', () => 'S')
        .with('development', () => 'D')
        .with('ephemeral', () => 'E')
        .exhaustive()}
    </div>
  )
}

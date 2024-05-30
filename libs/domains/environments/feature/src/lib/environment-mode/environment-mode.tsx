import { type VariantProps, cva } from 'class-variance-authority'
import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, type BadgeProps } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

const environmentModeVariants = cva('', {
  variants: {
    variant: {
      shrink: ['flex', 'h-4', 'w-4', 'justify-center', 'p-0', 'font-semibold'],
      full: [],
    },
  },
  defaultVariants: {
    variant: 'full',
  },
})

export interface EnvironmentModeProps
  extends Omit<BadgeProps, 'color' | 'variant'>,
    VariantProps<typeof environmentModeVariants> {
  mode: keyof typeof EnvironmentModeEnum
}

export function EnvironmentMode({ mode, className, variant, ...props }: EnvironmentModeProps) {
  variant ??= 'full'
  return match(mode)
    .with('PRODUCTION', () => (
      <Badge
        variant="outline"
        color="red"
        className={twMerge(className, environmentModeVariants({ variant }))}
        {...props}
      >
        {variant === 'full' ? 'Production' : 'P'}
      </Badge>
    ))
    .with('DEVELOPMENT', () => (
      <Badge
        variant="outline"
        color="neutral"
        className={twMerge(className, environmentModeVariants({ variant }))}
        {...props}
      >
        {variant === 'full' ? 'Development' : 'D'}
      </Badge>
    ))
    .with('PREVIEW', () => (
      <Badge
        variant="outline"
        color="purple"
        className={twMerge(className, environmentModeVariants({ variant }))}
        {...props}
      >
        {variant === 'full' ? 'Preview' : 'V'}
      </Badge>
    ))
    .with('STAGING', () => (
      <Badge
        variant="outline"
        color="neutral"
        className={twMerge(className, environmentModeVariants({ variant }))}
        {...props}
      >
        {variant === 'full' ? 'Staging' : 'S'}
      </Badge>
    ))
    .exhaustive()
}

export default EnvironmentMode

import { type VariantProps, cva } from 'class-variance-authority'
import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { type IconEnum } from '@qovery/shared/enums'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

const serviceBadgeVariants = cva(
  ['relative', 'flex', 'items-center', 'justify-center', 'rounded-full', 'border', 'border-neutral-200'],
  {
    variants: {
      size: {
        md: ['h-16', 'w-16'],
        xs: ['h-8', 'w-8'],
      },
    },
  }
)

const iconVariants = cva('', {
  variants: {
    size: {
      md: ['h-10', 'w-10'],
      xs: ['h-6', 'w-6'],
    },
  },
})

const typeVariants = cva(['absolute', '-right-0.5', '-top-0.5', 'p-0.5'], {
  variants: {
    size: {
      md: ['h-6', 'w-6'],
      xs: ['h-4', 'w-4', '-top-1', '-right-1.5'],
    },
  },
})

export interface ServiceBadgeProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'size'>,
    VariantProps<typeof serviceBadgeVariants> {
  icon: keyof typeof IconEnum
  type?: keyof typeof JobLifecycleTypeEnum
}

// TODO: Prepare component to update service icon with custom icon
export const ServiceBadge = forwardRef<ElementRef<'div'>, ServiceBadgeProps>(function ServiceBadge(
  { className, size = 'md', icon, type },
  forwardedRef
) {
  return (
    <div className={twMerge(serviceBadgeVariants({ size }), className)} ref={forwardedRef}>
      <Icon className={twMerge(iconVariants({ size }))} name={icon} />
      {type && (
        <Tooltip content={`Deployed with ${upperCaseFirstLetter(type)}`} disabled={size === 'xs'}>
          <span className={twMerge(typeVariants({ size }))}>
            <Icon className="h-full w-full" name={type} />
          </span>
        </Tooltip>
      )}
    </div>
  )
})

export default ServiceBadge

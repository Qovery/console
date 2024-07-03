import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { type IconEnum } from '@qovery/shared/enums'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'

const resourceAvatarVariants = cva(
  ['flex', 'items-center', 'justify-center', 'rounded-full', 'border', 'border-neutral-200'],
  {
    variants: {
      size: {
        md: ['h-16', 'w-16'],
        xs: ['h-8', 'w-8'],
      },
    },
  }
)

export interface ResourceAvatarProps
  extends Omit<ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, 'size'>,
    VariantProps<typeof resourceAvatarVariants> {}

export const ResourceAvatar = forwardRef<ElementRef<typeof AvatarPrimitive.Root>, ResourceAvatarProps>(function Avatar(
  { className, size, ...props },
  forwardedRef
) {
  return (
    <AvatarPrimitive.Root
      ref={forwardedRef}
      className={twMerge(resourceAvatarVariants({ size }), className)}
      {...props}
    />
  )
})

const resourceAvatarIconVariants = cva('', {
  variants: {
    size: {
      md: ['h-10', 'w-10'],
      xs: ['h-6', 'w-6'],
    },
  },
})

export interface ResourceAvatarIconProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'size'>,
    VariantProps<typeof resourceAvatarIconVariants> {
  icon: keyof typeof IconEnum
}

export const ResourceAvatarIcon = forwardRef<ElementRef<'span'>, ResourceAvatarIconProps>(function AvatarIcon(
  { className, size, icon, ...props },
  forwardedRef
) {
  return (
    <span ref={forwardedRef} {...props} className={twMerge(resourceAvatarIconVariants({ size }))}>
      <Icon className={twMerge(resourceAvatarIconVariants({ size }))} name={icon} />
    </span>
  )
})

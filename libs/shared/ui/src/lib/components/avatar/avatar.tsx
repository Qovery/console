import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { type VariantProps, cva } from 'class-variance-authority'
import {
  Children,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  cloneElement,
  forwardRef,
  useState,
} from 'react'
import { twMerge } from '@qovery/shared/util-js'

// Util from radix-thems copied from
// https://github.com/radix-ui/themes/blob/e500aac124faa4f15bb302aa120049c262767eaa/packages/radix-ui-themes/src/helpers/get-subtree.ts#L10
function getSubtree(
  options: { asChild: boolean | undefined; children: React.ReactNode },
  content: React.ReactNode | ((children: React.ReactNode) => React.ReactNode)
) {
  const { asChild, children } = options
  if (!asChild) return typeof content === 'function' ? content(children) : content

  const firstChild = Children.only(children) as React.ReactElement
  return cloneElement(firstChild, {
    children: typeof content === 'function' ? content(firstChild.props.children) : content,
  })
}

const avatarVariants = cva(['flex', 'items-center', 'justify-center'], {
  variants: {
    size: {
      md: ['h-16', 'w-16'],
      xs: ['h-8', 'w-8'],
    },
    radius: {
      none: [],
      full: ['rounded-full'],
    },
    border: {
      none: [],
      solid: ['border', 'border-neutral-200'],
    },
  },
  defaultVariants: {
    size: 'md',
    border: 'none',
    radius: 'full',
  },
})

interface AvatarProps extends AvatarImplProps, VariantProps<typeof avatarVariants> {}

const Avatar = forwardRef<AvatarImplElement, AvatarProps>(function Avatar(
  { asChild, children, className, style, size, border, radius, ...imageProps },
  forwardedRef
) {
  return (
    <AvatarPrimitive.Root
      className={twMerge(avatarVariants({ size, border, radius }), className)}
      style={style}
      asChild={asChild}
    >
      {getSubtree({ asChild, children }, <AvatarImpl ref={forwardedRef} size={size} border={border} {...imageProps} />)}
    </AvatarPrimitive.Root>
  )
})

type AvatarImplElement = ElementRef<typeof AvatarPrimitive.Image>

const avatarFallbackVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      md: [],
      xs: [],
    },
    border: {
      solid: [],
      none: [],
    },
  },
  compoundVariants: [
    { border: 'solid', size: 'md', className: ['h-10', 'w-10'] },
    { border: 'solid', size: 'xs', className: ['h-6', 'w-6'] },
    { border: 'none', size: 'md', className: ['h-16', 'w-16'] },
    { border: 'none', size: 'xs', className: ['h-8', 'w-8'] },
  ],
  defaultVariants: {
    size: 'md',
    border: 'none',
  },
})

interface AvatarImplProps
  extends ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
    VariantProps<typeof avatarFallbackVariants> {
  fallback: ReactNode
}

const AvatarImpl = forwardRef<AvatarImplElement, AvatarImplProps>(function AvatarImpl(
  { fallback, size, border, ...imageProps },
  forwardedRef
) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  return (
    <>
      {
        //No loading state define yet
        //{status === 'idle' || status === 'loading' ? <span className="rt-AvatarFallback" /> : null}
      }
      {status === 'error' ? (
        <AvatarPrimitive.Fallback className={avatarFallbackVariants({ size, border })}>
          {fallback}
        </AvatarPrimitive.Fallback>
      ) : null}
      <AvatarPrimitive.Image
        ref={forwardedRef}
        {...imageProps}
        onLoadingStatusChange={(status) => {
          imageProps.onLoadingStatusChange?.(status)
          setStatus(status)
        }}
      />
    </>
  )
})

export { Avatar }

export type { AvatarProps }

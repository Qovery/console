import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { Link as ReactLink, type LinkProps as ReactLinkProps } from 'react-router-dom'
import { match } from 'ts-pattern'
import { twMerge } from '@qovery/shared/util-js'
import { buttonVariants } from '../button-primitive/button-primitive'
import Icon from '../icon/icon'

const linkVariants = cva(
  ['cursor-pointer', 'transition', 'duration-100', 'font-medium', 'inline-flex', 'items-center', 'gap-1'],
  {
    variants: {
      color: {
        brand: ['text-brand-500', 'hover:text-brand-600'],
        red: ['text-red-500', 'hover:text-red-600'],
        sky: ['text-sky-500', 'hover:text-sky-600'],
        current: ['text-current', 'hover:brightness-75'],
      },
      size: {
        xs: ['text-xs'],
        sm: ['text-sm'],
      },
    },
    defaultVariants: {
      color: 'sky',
      size: 'sm',
    },
  }
)

const iconVariants = cva([], {
  variants: {
    size: {
      xs: ['text-2xs', 'leading-4'],
      sm: ['text-xs', 'leading-5'],
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export type ExternalLinkProps =
  | ((Omit<ComponentPropsWithoutRef<'a'>, 'color'> & VariantProps<typeof linkVariants>) & { withIcon?: boolean })
  | (Omit<ComponentPropsWithoutRef<'a'>, 'color'> & VariantProps<typeof buttonVariants> & { as: 'button' })

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  function ExternalLink(props, forwardedRef) {
    return match(props)
      .with({ as: 'button' }, ({ className, children, color, radius, size, variant, as, ...rest }) => (
        <a
          ref={forwardedRef}
          className={twMerge(buttonVariants({ color, radius, size, variant }), className)}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
        </a>
      ))
      .otherwise(({ children, color, size, className, withIcon = true, ...rest }) => (
        <a
          ref={forwardedRef}
          className={twMerge(linkVariants({ color, size }), className)}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
          {withIcon && <Icon iconName="arrow-up-right-from-square" className={iconVariants({ size })} />}
        </a>
      ))
  }
)

export type LinkProps =
  | (Omit<ReactLinkProps, 'color'> & VariantProps<typeof linkVariants>)
  | (Omit<ReactLinkProps, 'color'> & VariantProps<typeof buttonVariants> & { as: 'button' })

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, forwardedRef) {
  return match(props)
    .with({ as: 'button' }, ({ className, children, color, radius, size, variant, as, ...rest }) => (
      <ReactLink
        ref={forwardedRef}
        className={twMerge(buttonVariants({ color, radius, size, variant }), className)}
        {...rest}
      >
        {children}
      </ReactLink>
    ))
    .otherwise(({ className, children, color, size, ...rest }) => (
      <ReactLink ref={forwardedRef} className={twMerge(linkVariants({ color, size }), className)} {...rest}>
        {children}
      </ReactLink>
    ))
})

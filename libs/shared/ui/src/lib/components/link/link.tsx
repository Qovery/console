import { Link as RouterLink, type LinkProps as RouterLinkProps } from '@tanstack/react-router'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { twMerge } from '@qovery/shared/util-js'
import { buttonVariants } from '../button-primitive/button-primitive'
import Icon from '../icon/icon'

export const linkVariants = cva(
  ['cursor-pointer', 'transition', 'duration-100', 'font-medium', 'inline-flex', 'items-center', 'gap-1'],
  {
    variants: {
      color: {
        brand: ['text-brand', 'hover:text-brand-hover'],
        red: ['text-negative', 'hover:text-negative-hover'],
        sky: ['text-info', 'hover:text-info-hover'],
        neutral: ['text-neutral', 'hover:text-neutral-subtle'],
        subtle: ['text-neutral-subtle', 'hover:text-neutral'],
      },
      size: {
        xs: ['text-xs'],
        sm: ['text-sm'],
        ssm: ['text-ssm'],
      },
      underline: {
        true: ['hover:underline'],
        false: [],
      },
    },
    defaultVariants: {
      color: 'sky',
      size: 'sm',
      underline: false,
    },
  }
)

const iconVariants = cva([], {
  variants: {
    size: {
      xs: ['text-2xs', 'leading-4'],
      sm: ['text-xs', 'leading-5'],
      ssm: ['text-ssm', 'leading-6'],
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
      .with({ as: 'button' }, ({ className, children, color, radius, size, variant, as, iconOnly, ...rest }) => (
        <a
          ref={forwardedRef}
          className={twMerge(buttonVariants({ color, radius, size, variant, iconOnly }), className)}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
        </a>
      ))
      .otherwise(({ children, color, size, className, withIcon = true, underline, ...rest }) => (
        <a
          ref={forwardedRef}
          className={twMerge(linkVariants({ color, size, underline }), className)}
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
  | (RouterLinkProps & Omit<ComponentPropsWithoutRef<'a'>, 'color' | 'ref'> & VariantProps<typeof linkVariants>)
  | (RouterLinkProps &
      Omit<ComponentPropsWithoutRef<'a'>, 'color' | 'ref'> &
      VariantProps<typeof buttonVariants> & { as: 'button' })

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, forwardedRef) {
  return match(props)
    .with({ as: 'button' }, ({ className, children, color, radius, size, variant, as, iconOnly, ...rest }) => (
      <RouterLink
        ref={forwardedRef}
        className={twMerge(buttonVariants({ color, radius, size, variant, iconOnly }), className)}
        {...rest}
      >
        {children}
      </RouterLink>
    ))
    .otherwise(({ className, children, color, size, underline, ...rest }) => (
      <RouterLink ref={forwardedRef} className={twMerge(linkVariants({ color, size, underline }), className)} {...rest}>
        {children}
      </RouterLink>
    ))
})

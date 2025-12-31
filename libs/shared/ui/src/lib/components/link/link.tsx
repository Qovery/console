import { Link as RouterLink } from '@tanstack/react-router'
import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentProps, type ComponentPropsWithoutRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { twMerge } from '@qovery/shared/util-js'
import { buttonVariants } from '../button-primitive/button-primitive'
import Icon from '../icon/icon'

export const linkVariants = cva(
  [
    'cursor-pointer',
    'transition',
    'duration-100',
    'font-medium',
    'inline-flex',
    'items-center',
    'gap-1',
    'hover:brightness-75',
  ],
  {
    variants: {
      color: {
        brand: ['text-surface-brand-solid'],
        red: ['text-negative'],
        sky: ['text-info'],
        current: ['text-current'],
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

type RouterLinkComponentProps = ComponentProps<typeof RouterLink>

export type LinkProps =
  | (Omit<RouterLinkComponentProps, 'color' | 'ref' | 'params'> &
      VariantProps<typeof linkVariants> & {
        params?: Record<string, string>
      })
  | (Omit<RouterLinkComponentProps, 'color' | 'ref' | 'params'> &
      VariantProps<typeof buttonVariants> & { as: 'button' } & {
        params?: Record<string, string>
      })

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, forwardedRef) {
  return match(props)
    .with({ as: 'button' }, ({ className, children, color, radius, size, variant, as, params, ...rest }) => (
      <RouterLink
        ref={forwardedRef}
        className={twMerge(buttonVariants({ color, radius, size, variant }), className)}
        {...rest}
        {...(params ? { params: params as unknown as ComponentProps<typeof RouterLink>['params'] } : {})}
      >
        {children}
      </RouterLink>
    ))
    .otherwise(({ className, children, color, size, underline, params, ...rest }) => (
      <RouterLink
        ref={forwardedRef}
        className={twMerge(linkVariants({ color, size, underline }), className)}
        {...rest}
        {...(params ? { params: params as unknown as ComponentProps<typeof RouterLink>['params'] } : {})}
      >
        {children}
      </RouterLink>
    ))
})

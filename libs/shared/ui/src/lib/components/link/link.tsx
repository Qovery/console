import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { Link as ReactLink, type LinkProps as ReactLinkProps } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

const linkVariants = cva(
  ['cursor-pointer', 'transition', 'duration-100', 'font-medium', 'inline-flex', 'flex-center', 'gap-1'],
  {
    variants: {
      color: {
        brand: ['text-brand-500', 'hover:text-brand-600'],
        red: ['text-red-500', 'hover:text-red-600'],
        sky: ['text-sky-500', 'hover:text-sky-600'],
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

export interface ExternalLinkProps
  extends Omit<ComponentPropsWithoutRef<'a'>, 'color'>,
    VariantProps<typeof linkVariants> {}

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(function ExternalLink(
  { children, color, size, className, ...props },
  forwardedRef
) {
  return (
    <a
      ref={forwardedRef}
      className={twMerge(linkVariants({ color, size }), className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
      <Icon name={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE} className={iconVariants({ size })} />
    </a>
  )
})

export interface LinkProps extends Omit<ReactLinkProps, 'color'>, VariantProps<typeof linkVariants> {}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, color, size, className, ...props },
  forwardedRef
) {
  return (
    <ReactLink ref={forwardedRef} className={twMerge(linkVariants({ color, size }), className)} {...props}>
      {children}
    </ReactLink>
  )
})

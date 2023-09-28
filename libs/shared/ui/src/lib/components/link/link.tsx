import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { NavLink, type NavLinkProps } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

// TODO: already used on several components need to be removed
export interface BaseLink {
  link: string
  linkLabel?: string
  external?: boolean
}

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
        ssm: ['text-ssm'],
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
      ssm: ['text-xs', 'leading-5'],
      sm: ['text-xs', 'leading-5'],
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export interface ExternalLinkProps
  extends Omit<ComponentPropsWithoutRef<'a'>, 'color'>,
    VariantProps<typeof linkVariants> {
  className?: string
}

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(function Link(
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

export interface LinkProps extends Omit<NavLinkProps, 'color'>, VariantProps<typeof linkVariants> {
  className?: string
  icon?: IconAwesomeEnum | string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, color, size, className, icon, ...props },
  forwardedRef
) {
  return (
    <NavLink ref={forwardedRef} className={twMerge(linkVariants({ color, size }), className)} {...props}>
      {/* Fragment is necessary */}
      <>
        {children}
        {icon && <Icon name={icon} className={iconVariants({ size })} />}
      </>
    </NavLink>
  )
})

export interface ActionLinkProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>,
    VariantProps<typeof linkVariants> {
  onClick: () => void
  icon?: IconAwesomeEnum | string
  className?: string
}

export const ActionLink = forwardRef<HTMLSpanElement, ActionLinkProps>(function Link(
  { children, color, size, className, icon, onClick },
  forwardedRef
) {
  return (
    <span
      role="button"
      ref={forwardedRef}
      onClick={onClick}
      className={twMerge(linkVariants({ color, size }), className)}
    >
      {children}
      {icon && <Icon name={icon} className={iconVariants({ size })} />}
    </span>
  )
})

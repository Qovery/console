import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import { Link, useRouterState } from '@tanstack/react-router'
import { cva } from 'class-variance-authority'
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon } from '../icon/icon'

const sidebarItemVariants = cva(
  [
    'flex',
    'gap-2',
    'items-center',
    'py-2',
    'px-4',
    'text-sm',
    'font-medium',
    'cursor-pointer',
    'transition-colors',
    'truncate',
    'border-r',
    'border-r-transparent',
  ],
  {
    variants: {
      active: {
        true: ['text-brand', 'bg-surface-brand-component', 'border-r-surface-brand-solid'],
        false: [
          'text-neutral-subtle',
          'hover:text-brand',
          'hover:bg-surface-neutral-subtle',
          'hover:border-r-surface-brand-solid',
        ],
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

const sidebarSubItemVariants = cva(
  [
    'flex',
    'items-center',
    'py-2',
    'px-4',
    'text-sm',
    'font-medium',
    'cursor-pointer',
    'transition-colors',
    'truncate',
    'pl-[39px]',
    'border-r',
    'border-r-transparent',
  ],
  {
    variants: {
      active: {
        true: ['text-brand', 'bg-surface-brand-component', 'border-r-surface-brand-solid'],
        false: [
          'text-neutral-subtle',
          'hover:text-brand',
          'hover:bg-surface-neutral-subtle',
          'hover:border-r-surface-brand-solid',
        ],
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

interface SidebarContextValue {
  pathname: string
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

const useSidebarContext = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('Sidebar components must be used within Sidebar.Root')
  }
  return context
}

interface SidebarRootProps extends ComponentPropsWithoutRef<'div'>, PropsWithChildren {}

const SidebarRoot = forwardRef<ElementRef<'div'>, SidebarRootProps>(function SidebarRoot(
  { children, className, ...props },
  ref
) {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  return (
    <SidebarContext.Provider value={{ pathname }}>
      <div ref={ref} className={twMerge('flex flex-col', className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
})

const SidebarBadge = ({ children }: PropsWithChildren) => (
  <span
    data-testid="sidebar-badge"
    className="ml-auto rounded bg-surface-brand-solid px-1 text-3xs uppercase text-neutral-contrasted"
  >
    {children}
  </span>
)

type RouterLinkProps = ComponentProps<typeof Link>

interface SidebarItemProps extends Omit<RouterLinkProps, 'ref' | 'children'>, PropsWithChildren {
  icon?: IconName
  iconStyle?: IconStyle
  active?: boolean
  badge?: string
}

const SidebarItem = forwardRef<ElementRef<'a'>, SidebarItemProps>(function SidebarItem(
  { to, iconStyle, icon, active, badge, children, className, ...props },
  forwardedRef
) {
  const { pathname } = useSidebarContext()
  const isActive = active ?? pathname === to

  return (
    <Link
      to={to}
      ref={forwardedRef}
      className={twMerge(sidebarItemVariants({ active: isActive }), className)}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {icon && <Icon iconName={icon} className="inline-block text-sm" iconStyle={iconStyle ?? 'solid'} />}
      {children}
      {badge && <SidebarBadge>{badge}</SidebarBadge>}
    </Link>
  )
})

interface SidebarSubItemProps extends Omit<RouterLinkProps, 'ref' | 'children'>, PropsWithChildren {
  active?: boolean
  badge?: string
}

const SidebarSubItem = forwardRef<ElementRef<'a'>, SidebarSubItemProps>(function SidebarSubItem(
  { to, active, badge, children, className, ...props },
  forwardedRef
) {
  const { pathname } = useSidebarContext()
  const isActive = active ?? pathname === to

  return (
    <Link
      to={to}
      ref={forwardedRef}
      className={twMerge(sidebarSubItemVariants({ active: isActive }), className)}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
      {badge && <SidebarBadge>{badge}</SidebarBadge>}
    </Link>
  )
})

interface SidebarGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'>, PropsWithChildren {
  title: ReactNode
  icon?: IconName
  iconStyle?: IconStyle
  defaultOpen?: boolean
}

const SidebarGroup = forwardRef<ElementRef<'div'>, SidebarGroupProps>(function SidebarGroup(
  { title, iconStyle, icon, defaultOpen, children, className, ...props },
  ref
) {
  const { pathname } = useSidebarContext()
  const [open, setOpen] = useState(defaultOpen ?? false)

  const childLinks = Array.isArray(children) ? children : [children]
  const hasActiveChild = childLinks.some((child) => {
    if (child && typeof child === 'object' && 'props' in child) {
      return child.props?.to === pathname
    }
    return false
  })

  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true)
    }
  }, [hasActiveChild])

  return (
    <div ref={ref} className={twMerge('flex flex-col', className)} {...props}>
      <button
        type="button"
        data-testid="sidebar-group-trigger"
        onClick={() => setOpen(!open)}
        className={twMerge(sidebarItemVariants())}
      >
        {icon && <Icon iconName={icon} className="inline-block text-sm" iconStyle={iconStyle ?? 'solid'} />}
        {title}
        <Icon
          iconName="chevron-down"
          className={`ml-auto transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div data-testid="sidebar-group-content" className="w-full">
          {children}
        </div>
      )}
    </div>
  )
})

const Sidebar = Object.assign(
  {},
  {
    Root: SidebarRoot,
    Item: SidebarItem,
    Group: SidebarGroup,
    SubItem: SidebarSubItem,
  }
)

export { Sidebar }

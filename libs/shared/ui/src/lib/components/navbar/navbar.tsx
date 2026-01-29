import { Link } from '@tanstack/react-router'
import { cva } from 'class-variance-authority'
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { twMerge } from '@qovery/shared/util-js'

const navbarItemVariants = cva(
  [
    'relative',
    'inline-block',
    'select-none',
    'px-3',
    'py-3',
    'text-sm',
    'flex',
    'items-center',
    'justify-center',
    'no-underline',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus-visible:outline',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    'focus-visible:outline-brand-11',
    'font-medium',
    'rounded-md',
  ],
  {
    variants: {
      active: {
        true: ['text-brand'],
        false: ['text-neutral-subtle', 'hover:text-brand'],
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

interface NavbarContextValue {
  activeId?: string
  registerItem: (id: string, element: HTMLElement, contentElement: HTMLElement) => void
  unregisterItem: (id: string) => void
  listRef: React.RefObject<HTMLDivElement>
}

const NavbarContext = createContext<NavbarContextValue | undefined>(undefined)

const useNavbarContext = () => {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error('Navbar components must be used within Navbar.Root')
  }
  return context
}

interface NavbarRootProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children'> {
  activeId?: string
  children: ReactNode
  ariaLabel?: string
}

const NavbarRoot = forwardRef<ElementRef<'div'>, NavbarRootProps>(function NavbarRoot(
  { activeId, children, className, ariaLabel = 'Main navigation', ...props },
  ref
) {
  const [items, setItems] = useState<Map<string, HTMLElement>>(new Map())
  const [contentElements, setContentElements] = useState<Map<string, HTMLElement>>(new Map())
  const [itemIds, setItemIds] = useState<string[]>([])
  const [recalculate, setRecalculate] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const registerItem = useCallback((id: string, element: HTMLElement, contentElement: HTMLElement) => {
    setItems((prev) => {
      const next = new Map(prev)
      next.set(id, element)
      return next
    })
    setContentElements((prev) => {
      const next = new Map(prev)
      next.set(id, contentElement)
      return next
    })
    setItemIds((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id]
      }
      return prev
    })
  }, [])

  const unregisterItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    setContentElements((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    setItemIds((prev) => prev.filter((itemId) => itemId !== id))
  }, [])

  // Recalculate indicator position on window resize
  useEffect(() => {
    const handleResize = () => {
      setRecalculate((prev) => prev + 1)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getIndicatorStyle = useCallback(
    (itemId: string | undefined) => {
      if (!itemId || !listRef.current) return null
      const contentElement = contentElements.get(itemId)
      if (!contentElement) return null

      const listRect = listRef.current.getBoundingClientRect()
      const contentRect = contentElement.getBoundingClientRect()

      const translateX = contentRect.left - listRect.left
      const scaleX = contentRect.width / 100

      return {
        transform: `translateX(${translateX}px) scaleX(${scaleX})`,
        display: 'block',
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- contentElements is needed to recalculate indicator position
    [contentElements]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps -- recalculate is used to trigger recalculation on resize
  const activeStyle = useMemo(() => getIndicatorStyle(activeId), [getIndicatorStyle, activeId, recalculate])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (itemIds.length === 0) return

      const currentIndex = itemIds.findIndex((id) => document.activeElement === items.get(id))
      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          nextIndex = currentIndex - 1
          if (nextIndex < 0) nextIndex = itemIds.length - 1
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          nextIndex = currentIndex + 1
          if (nextIndex >= itemIds.length) nextIndex = 0
          break
        case 'Home':
          event.preventDefault()
          nextIndex = 0
          break
        case 'End':
          event.preventDefault()
          nextIndex = itemIds.length - 1
          break
        default:
          return
      }

      const nextElement = items.get(itemIds[nextIndex])
      nextElement?.focus()
    },
    [items, itemIds]
  )

  return (
    <NavbarContext.Provider value={{ activeId, registerItem, unregisterItem, listRef }}>
      <div
        {...props}
        ref={ref}
        className={twMerge('flex flex-row items-center justify-between', className)}
        aria-label={ariaLabel}
      >
        <div className="relative -my-1 -ml-3 -mr-1 flex touch-pan-x flex-row items-center justify-start overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            ref={listRef}
            className="relative flex h-11 items-center [&>*]:shrink-0"
            onKeyDown={handleKeyDown}
            role="group"
          >
            {children}

            {/* Active bottom bar indicator */}
            <div
              className="absolute bottom-0 left-0 h-0.5 w-[100px] origin-left rounded-t bg-brand-9 transition-transform duration-150 ease-out"
              style={{
                ...(activeStyle || { display: 'none' }),
              }}
            />
          </div>
        </div>
      </div>
    </NavbarContext.Provider>
  )
})

interface NavbarItemProps extends ComponentPropsWithoutRef<'a'> {
  id: string
  active?: boolean
  to?: string
}

const NavbarItem = forwardRef<ElementRef<'a'>, NavbarItemProps>(function NavbarItem(
  { id, active, children, className, to, ...props },
  forwardedRef
) {
  const { activeId, registerItem, unregisterItem } = useNavbarContext()
  const itemRef = useRef<HTMLAnchorElement | null>(null)
  const contentRef = useRef<HTMLSpanElement | null>(null)
  const isActive = active ?? activeId === id

  // Register/unregister using useEffect to avoid infinite loops
  useEffect(() => {
    if (itemRef.current && contentRef.current) {
      registerItem(id, itemRef.current, contentRef.current)
    }
    return () => {
      unregisterItem(id)
    }
  }, [id, registerItem, unregisterItem])

  // Combine refs - use ref callback pattern
  const setRefs = useCallback(
    (node: HTMLAnchorElement | null) => {
      // Update our ref
      itemRef.current = node

      // Forward the ref
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        // Use type assertion to bypass readonly check
        const ref = forwardedRef as React.MutableRefObject<HTMLAnchorElement | null>
        ref.current = node
      }
    },
    [forwardedRef]
  )

  return to ? (
    <Link
      to={to}
      ref={setRefs}
      className={twMerge(navbarItemVariants({ active: isActive }), className)}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={0}
    >
      <span ref={contentRef} className="flex items-center justify-center gap-1.5">
        {children}
      </span>
    </Link>
  ) : (
    <a
      {...props}
      ref={setRefs}
      data-active={isActive}
      className={twMerge(navbarItemVariants({ active: isActive }), className)}
      aria-current={isActive ? 'page' : undefined}
      tabIndex={0}
    >
      <span ref={contentRef} className="flex items-center justify-center gap-1.5">
        {children}
      </span>
    </a>
  )
})

const Navbar = Object.assign(
  {},
  {
    Root: NavbarRoot,
    Item: NavbarItem,
  }
)

export { Navbar, navbarItemVariants }

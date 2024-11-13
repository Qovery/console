import { ControlledMenu, type MenuCloseEvent } from '@szhsin/react-menu'
import { type MouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import Tooltip from '../tooltip/tooltip'
import MenuGroup from './menu-group/menu-group'
import { type MenuItemProps } from './menu-item/menu-item'

export enum MenuDirection {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum MenuAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

export type MenuData = {
  items: MenuItemProps[]
  label?: string
  title?: string
  sortAlphabetically?: boolean
  button?: {
    label: string | ReactNode
    onClick: () => void
  }
  search?: boolean
}[]

/*
  Replacer function to JSON.stringify that ignores
  circular references and internal React properties.
  https://github.com/facebook/react/issues/8669#issuecomment-531515508
*/
const ignoreCircularReferences = () => {
  const seen = new WeakSet()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (key: string, value: any) => {
    if (key.startsWith('_')) return // Don't compare React's internal props.
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return
      seen.add(value)
    }
    return value
  }
}

export interface MenuProps {
  trigger: ReactNode
  menus: MenuData
  children?: ReactNode
  direction?: MenuDirection
  open?: boolean
  arrowAlign?: MenuAlign
  triggerTooltip?: string
  className?: string
  header?: ReactNode
  onClose?: (e: MenuCloseEvent | MouseEvent<HTMLDivElement, MouseEvent>) => void
  width?: number
  paddingMenuY?: number
  paddingMenuX?: number
  onOpen?: (e: boolean) => void
  isFilter?: boolean
  portal?: boolean
}

/*
 * @deprecated Use DropdownMenu
 */
export function Menu(props: MenuProps) {
  const {
    trigger,
    children,
    direction = MenuDirection.BOTTOM,
    open,
    arrowAlign = MenuAlign.START,
    menus = [],
    className = '',
    onClose,
    width = 340,
    paddingMenuX = 8,
    paddingMenuY = 8,
    onOpen,
    isFilter,
    triggerTooltip,
    portal = true,
  } = props

  const ref = useRef(null)
  const [isOpen, setOpen] = useState<boolean | undefined>(undefined)
  // XXX: https://github.com/szhsin/react-menu/blob/d7c4df8a4324847403990174d9298038e11ac0c2/src/hooks/useClick.js
  const [skipOpen] = useState<{ v?: boolean }>({})

  // XXX: This is an ugly hack to solve poor design decision
  // `menus` prop is an array without distinct ids/keys
  // This is a trick to memoize menus items without ids coming from:
  // https://www.youtube.com/watch?v=G3OyF-lRAWo
  // https://github.com/samselikoff/2022-06-09-resizable-panel/commit/fe04a842367657b4acb1058c454d3eca739c419d
  // https://github.com/facebook/react/issues/8669#issuecomment-531515508
  const menusStringify = JSON.stringify(menus, ignoreCircularReferences())
  const menusMemo = useMemo(
    () =>
      menus.map((menu, index) => (
        <MenuGroup
          key={index}
          menu={menu}
          isLast={index === menus.length - 1}
          paddingMenuX={paddingMenuX}
          paddingMenuY={paddingMenuY}
          style={{ width }}
          isFilter={isFilter}
        />
      )),
    [menusStringify]
  )

  const handleClick = (e: MenuCloseEvent | null) => {
    if (ref.current) {
      const el = ref.current as HTMLElement
      const btn = el.querySelector('.btn, .btn-icon')
      btn?.classList.toggle('is-active')
    }

    if (isOpen && e && onClose) {
      onClose(e)
    }

    if (!e && !isOpen) {
      onOpen && onOpen(true)
    } else {
      onOpen && onOpen(false)
    }

    setOpen(!isOpen)
  }

  const closeMenu = () => {
    setOpen((previousOpen) => (previousOpen === undefined ? undefined : false))
    if (ref.current) {
      const el = ref.current as HTMLElement
      const btn = el.querySelector('.btn, .btn-icon')
      btn?.classList.remove('is-active')
    }
  }

  useEffect(() => {
    setOpen((previousOpen) => (previousOpen === undefined && open === false ? undefined : open))
    window.addEventListener('resize', closeMenu)
    window.addEventListener('scroll', closeMenu)
    return () => {
      window.removeEventListener('resize', closeMenu)
      window.removeEventListener('scroll', closeMenu)
    }
  }, [open])

  let offsetX = 0
  let offsetY = 0

  if (direction === MenuDirection.BOTTOM || direction === MenuDirection.TOP) {
    if (arrowAlign === MenuAlign.START) offsetX = -16
    if (arrowAlign === MenuAlign.END) offsetX = 16
  }

  if (direction === MenuDirection.LEFT || direction === MenuDirection.RIGHT) {
    if (arrowAlign === MenuAlign.START) offsetY = -16
    if (arrowAlign === MenuAlign.END) offsetY = 16
  }

  return (
    <>
      <div
        className={`menu__trigger w-max menu__trigger--${isOpen ? 'open' : 'closed'} ${className}`}
        ref={ref}
        onMouseDown={() => {
          skipOpen.v = isOpen
        }}
        onClick={() => (skipOpen.v ? (skipOpen.v = false) : handleClick(null))}
      >
        {!triggerTooltip ? (
          trigger
        ) : (
          <Tooltip content={triggerTooltip} delayDuration={100}>
            <span>{trigger}</span>
          </Tooltip>
        )}
      </div>
      <ControlledMenu
        state={isOpen === undefined ? undefined : isOpen ? 'open' : 'closed'}
        offsetX={offsetX}
        offsetY={offsetY}
        direction={direction}
        onClose={(e) => handleClick(e)}
        anchorRef={ref}
        align={arrowAlign}
        className="menu"
        menuClassName={`rounded-md shadow-[0_0_32px_rgba(0,0,0,0.08)] p-0 menu__container menu__container--${direction} ${
          isOpen !== undefined ? (isOpen ? 'menu__container--open' : 'menu__container--closed') : ''
        } menu__container--${arrowAlign} dark:bg-neutral-550 dark:border-solid dark:border-neutral-500`}
        portal={portal}
      >
        {children}
        {menusMemo}
      </ControlledMenu>
    </>
  )
}

export default Menu

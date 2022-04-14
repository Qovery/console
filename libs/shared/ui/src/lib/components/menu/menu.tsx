import React, { useEffect, useRef, useState } from 'react'
import { ControlledMenu, MenuCloseEvent } from '@szhsin/react-menu'
import MenuGroup from './menu-group/menu-group'
import { MenuItemProps } from './menu-item/menu-item'

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

export enum MenuSize {
  NORMAL = 'normal',
  BIG = 'big',
}

export interface MenuProps {
  trigger: React.ReactElement
  children?: React.ReactNode
  direction?: MenuDirection
  open?: boolean
  arrowAlign?: MenuAlign
  menus: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string }[]
  className?: string
  header?: React.ReactNode
  onClose?: (e: MenuCloseEvent) => void
  size?: MenuSize
}

export function Menu(props: MenuProps) {
  const {
    trigger,
    children,
    direction = MenuDirection.BOTTOM,
    open = false,
    arrowAlign = MenuAlign.START,
    menus = [],
    className = '',
    onClose,
    size = MenuSize.NORMAL,
  } = props

  const ref = useRef(null)
  const [isOpen, setOpen] = useState(false)

  const handleActive = (e: MenuCloseEvent | null) => {
    setOpen(!isOpen)

    if (ref.current) {
      const el = ref.current as HTMLElement
      const btn = el.querySelector('.btn, .btn-icon')
      btn?.classList.toggle('is-active')
    }

    if (isOpen && e && onClose) {
      onClose(e)
    }
  }

  const closeMenu = () => {
    setOpen(false)
    if (ref.current) {
      const el = ref.current as HTMLElement
      const btn = el.querySelector('.btn, .btn-icon')
      btn?.classList.remove('is-active')
    }
  }

  useEffect(() => {
    setOpen(open)
    window.addEventListener('resize', closeMenu)
    return () => window.removeEventListener('resize', closeMenu)
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
      <div className="w-max menu__trigger" ref={ref} onClick={(e) => handleActive(null)}>
        {trigger}
      </div>
      <ControlledMenu
        state={isOpen ? 'open' : 'closed'}
        arrow={true}
        offsetX={offsetX}
        offsetY={offsetY}
        direction={direction}
        onClose={(e) => handleActive(e)}
        anchorRef={ref}
        align={arrowAlign}
        className="menu z-20"
        menuClassName={`${
          size === MenuSize.BIG ? 'w-[374px]' : 'w-[340px]'
        } rounded-md shadow-lg p-0 ${className} menu__container menu__container--${direction} menu__container--${
          isOpen ? 'open' : 'closed'
        } menu__container--${arrowAlign}`}
        transition={true}
        portal={true}
      >
        {children}
        {menus.map((menu, index) => (
          <MenuGroup key={index} menu={menu} isLast={index === menus.length - 1 ? true : false} size={size}></MenuGroup>
        ))}
      </ControlledMenu>
    </>
  )
}

export default Menu

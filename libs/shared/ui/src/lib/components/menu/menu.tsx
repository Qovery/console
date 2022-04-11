import React, { useEffect, useRef, useState } from 'react'
import { ControlledMenu } from '@szhsin/react-menu'
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

export interface MenuProps {
  trigger: React.ReactNode
  children?: React.ReactNode
  direction?: MenuDirection
  open?: boolean
  arrowAlign?: MenuAlign
  menus: { items: MenuItemProps[]; title?: string; button?: string; buttonLink?: string }[]
  className?: string
  header?: React.ReactNode
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
  } = props

  const ref = useRef(null)
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    setOpen(open)
  }, [open])

  return (
    <>
      <div className="w-max" ref={ref} onClick={() => setOpen(true)}>
        {trigger}
      </div>
      <ControlledMenu
        state={isOpen ? 'open' : 'closed'}
        arrow={true}
        direction={direction}
        onClose={() => setOpen(false)}
        anchorRef={ref}
        align={arrowAlign}
        className="menu"
        menuClassName={`${className} menu__container menu__container--${direction} menu__container--${
          isOpen ? 'open' : 'closed'
        }`}
        transition={true}
      >
        {children}
        {menus.map((menu, index) => (
          <MenuGroup key={index} menu={menu} isLast={index === menus.length - 1 ? true : false}></MenuGroup>
        ))}
      </ControlledMenu>
      {isOpen && (
        <div className="menu__overlay fixed w-full h-full top-0 left-0 bg-element-light-darker-500 opacity-20 z-50"></div>
      )}
    </>
  )
}

export default Menu

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

  const handleActive = () => {
    if (ref.current) {
      const el = ref.current as HTMLElement
      const btn = el.querySelector('.btn, .btn-icon')
      btn?.classList.toggle('is-active')
    }
    setOpen(!isOpen)
  }

  useEffect(() => {
    setOpen(open)
  }, [open])

  return (
    <>
      <div className="w-max menu__trigger" ref={ref} onClick={handleActive}>
        {trigger}
      </div>
      <ControlledMenu
        state={isOpen ? 'open' : 'closed'}
        arrow={true}
        direction={direction}
        onClose={handleActive}
        anchorRef={ref}
        align={arrowAlign}
        className="menu z-[9999]"
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
    </>
  )
}

export default Menu

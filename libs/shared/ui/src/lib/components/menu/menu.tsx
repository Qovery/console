import React, { useEffect, useRef, useState } from 'react'
import { ControlledMenu } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'
import MenuGroup from './menu-group/menu-group'

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
  menus: { name: string; link: string }[][]
  className?: string
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
    if (open) {
      setOpen(true)
    }
  }, [])

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
        menuClassName={className}
      >
        {children}
        {menus.map((menu, index) => (
          <MenuGroup key={index} menu={menu} isLast={index === menus.length - 1 ? false : true}></MenuGroup>
        ))}
      </ControlledMenu>
    </>
  )
}

export default Menu
